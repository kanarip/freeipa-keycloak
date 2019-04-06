## Proof of Concept environment

Uses FreeIPA and Keycloak with an IMAP server that validates bearer tokens with some in-browser JS
against some Python 3 API (currently aiohttp)

- Regenerate some SSL certificates

```
$ data/ssl/bin/regen
```

- Launch some containers (it'll build what's missing)

```
$ docker-compose up [-d]
```

- Add to `/etc/hosts` (the containers don't need this, but your browser does):

```
172.16.66.1     ipa.example.local
172.16.66.2     keycloak.example.local
172.16.66.3     postgres.example.local
172.16.66.4     imap.example.local
172.16.66.5     api.example.local
172.16.66.6     cdn.example.local
172.16.66.7     demo.example.local
```

Your FreeIPA admin interface should be on https://ipa.example.local/

Your Keycloak admin interface should be on https://keycloak.example.local:8443/
