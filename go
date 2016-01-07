echo Relaunching
/root/.nvm/nvm.sh use node
pwd
if [ -f .pid ]; then
        kill -9 `cat .pid`
fi

PORT=777 \
 node --debug=5777 bin/agileEstimates > ./log 2>&1 &

echo $! > .pid
echo pid: `cat ./.pid`

