# 码农周刊代理

当前版本的码农周刊需要收费订阅了，该脚本简单的爬取码农周刊的网站并发送到目标邮箱。

## 编译

```shell
cargo build --release
```

## 使用

```shell
target/release/manong_weekly_agent -c config.yaml
```

### 定时任务

```crontab
0 0 22 ? * THU /code/cron/manong_weekly_agent/manong_weekly_agent -c /code/cron/manong_weekly_agent/config.yaml
```