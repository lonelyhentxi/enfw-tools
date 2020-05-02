# 东方学刊代理

该脚本简单的爬取东方学刊的网站并发送链接到目标邮箱。

## 编译

```shell
cargo build --release
```

## 使用

```shell
target/release/dongfang_journal_agent -c config.yaml
```

### 定时任务

```crontab
0 0 22 ? * WED /code/cron/dongfang_journal_agent/dongfang_journal_agent -c /code/cron/dongfang_journal_agent/config.yaml
```