use lettre::{SmtpClient, ClientSecurity, ClientTlsParameters, SmtpTransport,
             Transport, SendableEmail};
use lettre_email::EmailBuilder;
use std::path::Path;
use lettre::smtp::authentication::{Mechanism, Credentials};
use lettre::smtp::ConnectionReuseParameters;
use std::error::Error;
use std::io::{Write, Read};
use curl::easy::Easy;
use std::fs::OpenOptions;
use victoria_dom::DOM;
use chrono::Utc;
use clap::{Arg, App, SubCommand};
use serde::{Serialize, Deserialize};
use std::convert::TryFrom;
use native_tls::{Protocol, TlsConnector};

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    smtp_username: String,
    smtp_password: String,
    smtp_host: String,
    smtp_port: u16, // only used in tls mode
    smtp_mechanism: Mechanism,
    use_tls: bool,
    from_email: String,
    from_alias: String,
    to_email: String,
    to_alias: String,
    next_no: u32,
}

#[derive(Debug)]
struct Weekly {
    title: String,
    body: String,
}

fn log(content: String) {
    println!("[{}]: {}", Utc::now(), content);
}

fn build_mailer(config: &Config) -> Result<SmtpTransport, Box<dyn Error>> {
    log(format!("signing in '{}:{}' with username '{}' and {:?} mechanism",
                config.smtp_host, config.smtp_port, config.smtp_username, config.smtp_mechanism));
    let mailer = if config.use_tls {
        let mut tls_builder = TlsConnector::builder();
        tls_builder.min_protocol_version(Some(Protocol::Tlsv10));
        let tls_parameters = ClientTlsParameters::new(
            config.smtp_host.clone(), tls_builder.build()?);
        log(String::from("preparing tls..."));
        SmtpClient::new(
            (&config.smtp_host as &str, config.smtp_port),
            ClientSecurity::Required(tls_parameters),
        )?
    } else {
        SmtpClient::new_simple(
            &config.smtp_host
        )?
    };
    Ok(mailer
    .authentication_mechanism(config.smtp_mechanism.clone())
    .credentials(Credentials::new(config.smtp_username.clone(),
                                  config.smtp_password.clone()))
    .connection_reuse(ConnectionReuseParameters::ReuseUnlimited)
    .transport())
}

fn send_email(
    mailer: &mut SmtpTransport,
    config: &Config,
    weekly: Weekly
) -> Result<(), Box<dyn Error>> {
    log(format!("sending email from '{}' to '{}' ...", config.from_email, config.to_email));
    let email = EmailBuilder::new()
        .to((config.to_email.clone(), config.to_alias.clone()))
        .from((config.from_email.clone(), config.from_alias.clone()))
        .subject(weekly.title)
        .html(weekly.body)
        .build()?;
    let email = SendableEmail::try_from(email)?;
    mailer.send(email)?;
    mailer.close();
    log(format!("email sent"));
    Ok(())
}

fn load_config(path: &Path) -> Result<Config, Box<dyn Error>> {
    let mut file = OpenOptions::new().read(true)
        .open(path)?;
    let mut config_str = String::new();
    file.read_to_string(&mut config_str)?;
    let config = serde_yaml::from_str(&config_str)?;
    log(format!("config loaded"));
    Ok(config)
}

fn update_config(path: &Path, mut config: Config) -> Result<(),Box<dyn Error>> {
    config.next_no += 1;
    let mut file = OpenOptions::new().read(true).create(true).write(true).open(path)?;
    let config_str = serde_yaml::to_vec(&config)?;
    file.write_all(&config_str)?;
    log(format!("updated config no to {}", config.next_no));
    Ok(())
}

fn fetch_weekly(no: u32) -> Result<Weekly, Box<dyn Error>> {
    let url = format!("https://weekly.manong.io/issues/{}", no);
    let mut html = Vec::<u8>::new();
    let mut handle = Easy::new();
    handle.url(&url)?;
    {
        let mut transfer = handle.transfer();
        transfer.write_function(|new_data| {
            html.extend_from_slice(new_data);
            Ok(new_data.len())
        })?;
        transfer.perform()?;
    }
    let html  = String::from_utf8(html)?;
    let dom = DOM::new(&html);
    let title = dom.at("body h1:first-child")
        .ok_or("invalid title")?;
    log(format!("fetched weekly, and the title is {}", title.text_all()));
    Ok(Weekly {title: title.text_all(), body: html})
}

fn fetch_and_send(path: &Path) -> Result<(),Box<dyn Error>>{
    log(String::from("preparing to fetch and send..."));
    let config = load_config(path)?;
    let weekly = fetch_weekly(config.next_no)?;
    let mut mailer = build_mailer(&config   )?;
    send_email(&mut mailer, &config, weekly)?;
    update_config(path, config)?;
    Ok(())
}

fn test_config(path: &Path) -> Result<(), Box<dyn Error>> {
    log(String::from("testing your config..."));
    let config = load_config(path)?;
    let weekly = Weekly {
        title: String::from("manong weely agent test"),
        body: String::from(r#"<p>manong weely agent test</p>"#)
    };
    let mut mailer = build_mailer(&config)?;
    send_email(&mut mailer, &config, weekly)?;
    Ok(())
}

fn main() {
    let matches = App::new("Manong Weekly Agent")
        .version("0.1.0")
        .author("lonelyhentai <master@evernightfireworks.com>")
        .about("Crawl and send to your email")
        .arg(Arg::with_name("config")
                 .short("c")
                 .long("config")
                 .value_name("FILE")
            .help("Set a yaml config file")
            .required(true)
        )
        .subcommand(
            SubCommand::with_name("test")
                .about("test config file and send example file to email")
        )
        .get_matches();
    let config_path = matches.value_of("config").expect("no config file path given");
    let path = Path::new(config_path);
    match matches.subcommand() {
        ("test", _) => { test_config(path).unwrap() },
        _ => { fetch_and_send(path).unwrap() }
    }
}
