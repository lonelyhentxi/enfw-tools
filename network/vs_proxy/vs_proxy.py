from xml.dom.minidom import parseString
from pathlib import Path
import platform
import os
import sys
import ctypes
from typing import Optional, Callable

CONFIF_RELATIVE_PATH = Path('Common7/IDE/devenv.exe.config')


def parse_proxy_config(vs_home: Path,
                       proxy_value: str = 'http://127.0.0.1:1080/'):
    config_file_path = vs_home / CONFIF_RELATIVE_PATH
    if not (config_file_path.exists() and config_file_path.is_file()):
        raise Exception(
            f'{config_file_path.resolve()} does not exist or is not a file')
    with config_file_path.open('r+', encoding='utf-8') as f:
        content = f.read()
        dom = parseString(content)
        root = dom.documentElement
        system_net = root.getElementsByTagName('system.net')[0]
        proxy_items = system_net.getElementsByTagName('defaultProxy')
        if len(proxy_items) == 0:
            proxy_item = dom.createElement("defaultProxy")
            proxy_item.setAttribute('useDefaultCredentials', 'true')
            proxy_item.setAttribute('enabled', 'true')
            proxy_content = dom.createElement('proxy')
            proxy_content.setAttribute('bypassonlocal', 'true')
            proxy_content.setAttribute('proxyaddress', proxy_value)
            proxy_item.appendChild(proxy_content)
            system_net.appendChild(proxy_item)
            f.seek(0, 0)
            f.write(dom.toxml())


def detect_vs_home() -> Optional[str]:
    return os.environ.get('vs_home')


def is_admin() -> bool:
    return ctypes.windll.shell32.IsUserAnAdmin()


def sudo(task: Callable):
    if is_admin():
        task()
    else:
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, __file__, None, 1
        )


if __name__ == '__main__':
    if platform.system() != 'Windows':
        raise Exception('this script only works on windows with vs')
    vs_home = detect_vs_home()
    if vs_home is None:
        raise Exception('can not get vs_home environment variable')
    vs_home_path = Path(vs_home)
    sudo(lambda: parse_proxy_config(vs_home_path))
