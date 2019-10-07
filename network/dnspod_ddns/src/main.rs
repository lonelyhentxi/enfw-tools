use std::io::Read;
use curl::easy::{Easy,ReadError};
use json::{self,JsonValue};
use dirs;
use std::fs::File;
use std::str;
use std::error::Error;
use chrono::prelude::*;

#[derive(Clone, Copy, Debug)]
enum ProtocolType {
    Ipv6,
    Ipv4
}

fn read_config() -> JsonValue {
    let config_path = dirs::home_dir().unwrap()
        .join(".config").join("dnspod_ddns").join("config.json");
    let mut file = File::open(config_path).unwrap();
    let mut record_str = String::new();
    file.read_to_string(&mut record_str).unwrap();
    json::parse(&record_str).unwrap()
}

fn fetch_last_ip(login_token:&str, domain_id: &str, record_id: &str,
record_line_id: &str, sub_domain: &str, kind: ProtocolType) -> Result<String,Box<dyn Error>> {
    let post_str = format!(
        "login_token={}&format=json&domain_id={}&sub_domain={}&record_id={}&record_line_id={}&record_type={}",
        login_token, domain_id,  sub_domain, record_id, record_line_id,
        match kind { ProtocolType::Ipv4 => "A", ProtocolType::Ipv6 => "AAAA" });
    let mut post_data = post_str.as_bytes();
    let mut res_data = Vec::new();
    let mut easy = Easy::new();
    easy.url("https://dnsapi.cn/Record.List")?;
    easy.post(true)?;
    easy.post_field_size(post_data.len() as u64)?;
    {
        let mut transfer = easy.transfer();
        transfer.read_function(|buf| {
            post_data.read(buf).map_err(|_| ReadError::Abort)
        })?;
        transfer.write_function(|data| {
            res_data.extend_from_slice(data);
            Ok(data.len())
        })?;
        transfer.perform()?;
    }
    let res_json = json::parse(str::from_utf8(res_data. as_slice())?)?;
    let value_json = &res_json["records"][0]["value"];
    if value_json.is_string() {
        Ok(value_json.as_str()
            .ok_or_else(|| json::Error::WrongType(
                "there should be at least one record with string value".to_owned()
                ))?.to_owned())
    } else {
        Err(Box::new(
            json::Error::WrongType("there should be at least one record with string value".to_owned()))) 
    }
}

fn fetch_current_ip(kind: ProtocolType) -> Result<String,Box<dyn Error>> {
    let mut res_data = Vec::new();
    let mut easy = Easy::new();
    easy.url(match kind {
        ProtocolType::Ipv4 => "https://ipv4bot.whatismyipaddress.com/",
        _ => "https://ipv6bot.whatismyipaddress.com/"
    })?;
    {
        let mut transfer = easy.transfer();
        transfer.write_function(|data| {
            res_data.extend_from_slice(data);
            Ok(data.len())
        })?;
        transfer.perform()?;
    }
    let res = String::from_utf8(res_data)?;
    Ok(res)
}

fn set_new_ip(login_token:&str, domain_id: &str, record_id: &str,
record_line_id: &str, sub_domain: &str, kind: ProtocolType, new_ip: &str) -> Result<(),Box<dyn Error>> {
    let post_str = format!(
        "login_token={}&format=json&domain_id={}&sub_domain={}&record_id={}&record_line_id={}&record_type={}&value={}",
        login_token, domain_id,  sub_domain, record_id, record_line_id,
        match kind { ProtocolType::Ipv4 => "A", ProtocolType::Ipv6 => "AAAA" }, new_ip);
    let mut post_data = post_str.as_bytes();
    let mut easy = Easy::new();
    easy.url("https://dnsapi.cn/Record.Modify")?;
    easy.post(true)?;
    easy.post_field_size(post_data.len() as u64)?;
        let mut transfer = easy.transfer();
    transfer.read_function(|buf| {
        post_data.read(buf).map_err(|_| ReadError::Abort)
    })?;
    transfer.perform()?;
    Ok(())
}

fn update_single_record(record: &JsonValue) -> Result<(), Box<dyn Error>> {
    let format_error = || {json::JsonError::WrongType("config error invalid".to_owned())};
    let login_token = record["login_token"].as_str().ok_or_else(format_error)?;
    let domain_id = record["domain_id"].as_str().ok_or_else(format_error)?;
    let record_id = record["record_id"].as_str().ok_or_else(format_error)?;
    let record_line_id = record["record_line_id"].as_str().ok_or_else(format_error)?;
    let sub_domain = record["sub_domain"].as_str().ok_or_else(format_error)?;
    let kind = if record["kind"] == "ipv4" { ProtocolType::Ipv4 } else  { ProtocolType::Ipv6 };
    let last_ip = fetch_last_ip(login_token, domain_id, record_id, record_line_id, sub_domain, kind)?;
    let current_ip = fetch_current_ip(kind)?;
    let now = Local::now();
    println!("[info]: {}",now.to_rfc3339());
    println!(
        "[info]: domain_id={},sub_domain={},record_id={},record_line_id={},record_type={}",
        domain_id,  sub_domain, record_id, record_line_id, 
        match kind { ProtocolType::Ipv4 => "A", ProtocolType::Ipv6 => "AAAA" });
    println!("[info]: last ip is \"{}\"", last_ip);
    println!("[info]: current ip is \"{}\"", current_ip);
    if last_ip!=current_ip {
        set_new_ip(login_token, domain_id, record_id, record_line_id, sub_domain, kind, &current_ip)?;
        println!("[info]: update ip to \"{}\"", current_ip);
    } else {
        println!("[info]: not updated");
    }
    Ok(())
}

fn main() {
    let config = read_config();
    if config.is_array() {
        for i in 0..config.len() {
            update_single_record(&config[i]).unwrap_or_else(|err| {
                eprintln!("[error]: {}", err);
            })
        }
    } else {
        eprintln!("[warning]: There have no records");
    }
}
