FROM armhfbuild/alpine:3.1

RUN apk update && apk add curl bash curl-dev gcc g++ libusb-compat libusb-compat-dev \
  && curl -L https://github.com/ubergesundheit/go-cron/releases/download/v0.0.7-armhf/go-cron-linux-armhf.gz \
    | zcat > /usr/local/bin/go-cron \
  && chmod u+x /usr/local/bin/go-cron \
  && rm -rf /var/cache/apk/*

WORKDIR /temper
COPY temper.c /temper/
COPY pcsensor.c /temper/
COPY pcsensor.h /temper/
COPY entrypoint.sh /temper/

CMD ["./entrypoint.sh"]
