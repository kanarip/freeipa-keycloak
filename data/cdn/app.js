"use strict";

let d = new Date();

// should have theme
let load_css = (url, callback) => {
    var link = document.createElement('link');

    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = 'all';
    link.onload = callback;

    document.head.appendChild(link);
}

let load_script = (url, callback) => {
    // Adding the script tag to the head as suggested before
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;

    // Fire the loading
    document.head.appendChild(script);
}

let initialize = function() {
    document.body.innerHTML = "<p>Today's date is " + d + "</p>"
        + "<p>Timezone: " + Intl.DateTimeFormat().resolvedOptions().timeZone + "</p>"
        + "<p>Language: " + window.navigator.language + "</p>"
        // This should probably be the one to use, because we can iterate over languages until one is available.
        + "<p>Language(s): " + window.navigator.languages + "</p>";

    $(document).ready(
        function() {
            document.body.innerHTML += "<table><tr><th>And you are?</th></tr><tr><td><input type='text' name='username' value='jeroen@example.local'></td></tr></table>";

            load_script('https://keycloak.example.local:8443/auth/js/keycloak.js', start_keycloak);
        }
    );
}

let start_keycloak = () => {
    console.log('loading!');
    $(document).ready(() => {
            console.log('loading for realz!');
            var username = $('input[name="username"]').val();
            var realm = username.split("@")[1];
            var server = 'api.' + realm;
            var resource = location.hostname;

            var keycloak = Keycloak({
                // A keycloak container
                url: 'https://keycloak.example.local:8443/auth/',
                realm: realm,
                clientId: resource
            });

            keycloak.init({onLoad: 'login-required'})
                .success(authenticated => {
                    document.body.innerHTML += "<p>" + (authenticated ? 'authenticated' : 'not authenticated') + "</p>";
                });

            keycloak.onAuthSuccess = () => {
                var url = 'https://' + server + '/' + username;

                console.log('url: ' + url);

                document.body.innerHTML += '<p>' + keycloak.token + '</p>';

                var req = new XMLHttpRequest();

                req.open('GET', url, true);
                req.setRequestHeader('Accept', 'application/json');
                req.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
                req.onreadystatechange = () => {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            document.body.innerHTML += "<pre>" + JSON.stringify(JSON.parse(req.responseText), undefined, 4) + "</pre>";
                        }
                        else if (req.status == 403) {
                            alert('Forbidden');
                        }
                    }
                }

                req.send();

                document.body.innerHTML += "<p>Subject: " + keycloak.subject + "</p>"
                    + "<p>Name: " + keycloak.idTokenParsed.name + "</p>"
                    + "<p>Given name: " + keycloak.idTokenParsed.given_name + "</p>"
                    + "<p>Preferred username: " + keycloak.idTokenParsed.preferred_username + "</p>"
                    + "<p>Email address: " + keycloak.idTokenParsed.email + "</p>";

                keycloak.loadUserProfile(
                    () => {
                        document.body.innerHTML += "<p>Account Service</p>"
                            + "<p>username: " + keycloak.profile.username + "</p>"
                            + "<p>email: " + keycloak.profile.email + "</p>"
                            + "<p>firstname + lastname: " + keycloak.profile.firstName + ' ' + keycloak.profile.lastName + "</p>"
                            + "<p>firstname: " + keycloak.profile.firstName + "</p>"
                            + "<p>lastname: " + keycloak.profile.lastName + "</p>";
                    },
                    () => {
                        document.body.innerHTML += "<p>Failed to retrieve user details. Please enable claims or account role</p>";
                    }
                );
            }
        });
}

load_css('https://cdn.example.local/spinner.css');

// shouldn't do this, should take jeroen@demo.kolab.org, use 'demo.kolab.org', find an end-point
// somehow. we'd use demo.klab.cc to bring this point home.
load_script('https://cdn.example.local/jquery.js', initialize);
