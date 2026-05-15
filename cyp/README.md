# cyp


http://你的IP:8083

```text

docker run -d \
  --name=cyp \
  --net="host" \
  -e PORT=8083  \
  --restart unless-stopped \
  ghcr.io/hy5528/cyp66:latest

```
