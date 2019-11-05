rsync -avP --progress -e 'ssh -i ~/.ssh/id_ed25519' root@192.168.6.55:/storage/backup/backup.img.gz /mnt/d/temp
# -z, compress
# -c, checksum
# --block-size=SIZE, recommand 2048