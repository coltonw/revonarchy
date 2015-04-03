#!/bin/sh
# The script must run from the expected directory:
cd ${0%/*}
echo "running coveralls script from:"
pwd

# Piping directly from node was only sending one line for some reason
# so I create a file and then cat it which works
iojs ./node_modules/mocha/bin/_mocha test/** -R mocha-lcov-reporter > coverage.lcov
cat coverage.lcov | iojs ./node_modules/coveralls/bin/coveralls.js

# always exit success, build should not depend on coveralls
exit 0
