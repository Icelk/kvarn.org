#!/bin/fish

cd public

for file in (fd -g "*.html")
    set file (echo $file | tail -c +3)
    echo "Comparing $file:"
    curl http://localhost:8080/$file >local.html
    curl https://kvarn.org/$file >remote.html

    diff local.html remote.html
end

rm local.html remote.html
