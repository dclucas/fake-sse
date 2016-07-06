'use strict';

const Hapi = require('hapi');
const Path = require('path');
const PassThrough = require('stream').PassThrough;

const server = new Hapi.Server();
server.connection({ port: 4000 });

server.register([require('inert'), require('susie')], (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'POST',
        path: '/fakes',
        handler: function (request, reply) {
            const payload = request.payload;
            server.route({
                method: request.payload.method,
                path: request.payload.path,
                handler: function(req, res) {
                    const stream = new PassThrough({ objectMode: true });
                    const l = payload.data.length;
                    var i = 0;
                    var timer = setInterval(() => {
                        stream.write(payload.data[i++ % l]);
                        if ((i >= l) && !payload.repeat) {
                            clearInterval(timer);
                        }
                    }, 200);
                    res.event(stream, null, { event: payload.event });
                }
            });
            reply('done');
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('Server started!');
    });
});