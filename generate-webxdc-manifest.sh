#!/bin/sh

echo -n 'name = "'
# Get the contents of the `<title>` element of `index.html`
grep -oP "(?<=<title>).*?(?=</title>)" index.html | tr -d '\n' \
&& echo '"' \
&& echo -n 'source_code_url = "https://github.com/WofWca/vikunja-frontend"'
