'use strict'

var path    = require('path')
var test    = require('tap').test
var request = require('request')
var helper  = require('../../lib/agent_helper.js')
var API     = require('../../../api.js')


test(
  "Restify router introspection",
  {skip: function () {return semver.satisfies(process.version, '>=7.0.0')}},
  function (t) {
  t.plan(3)

  var agent  = helper.instrumentMockedAgent()
  var server = require('restify').createServer()
  var api    = new API(agent)


  agent.config.application_id = '12345'
  agent.config.browser_monitoring.browser_key = '12345'
  agent.config.browser_monitoring.js_agent_loader = 'function(){}'

  t.tearDown(function cb_tearDown() {
    server.close(function cb_close() {
      helper.unloadAgent(agent)
    })
  })

  server.get('/test/:id', function (req, res, next) {
    var rum = api.getBrowserTimingHeader()
    t.equal(rum.substr(0,7), '<script')
    res.send({status : 'ok'})
    next()
  })

  server.listen(8089, function () {
    request.get('http://localhost:8089/test/31337',
                {json : true},
                function (error, res, body) {

      t.equal(res.statusCode, 200, "nothing exploded")
      t.deepEqual(body, {status : 'ok'}, "got expected respose")
      t.end()
    })
  })
})
