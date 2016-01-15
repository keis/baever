import ESPoll from 'espoll'
import terminus from 'terminus'
import each from 'util-each'
import { Client } from 'elasticsearch'
import AnsiConvert from 'ansi-to-html'

const ansiConvert = new AnsiConvert({bg: 'none'})

var poll

function watch (options) {
  if (options.host == null) {
    throw new Error('Need to specify elasticsearch host')
  }

  if (options.taskId == null) {
    throw new Error('Need to specify task ID')
  }

  const client = new Client({
    host: options.host,
    log: 'error'
  })

  const ep = new ESPoll({
    client: client,
    index: 'logstash-*',
    query: { term: {'mesos.task_id.raw': options.taskId} },
    delay: 5000
  })

  const el = document.getElementById('logview')

  el.innerHTML = ''

  ep.pipe(terminus({objectMode: true}, (obj, enc, cb) => {
    var line = document.createElement('span')
    line.innerHTML = obj._source['@timestamp'] + ' ' + ansiConvert.toHtml(obj._source.message)
    el.appendChild(line)
    cb()
  }))

  return ep
}

function parseOpts (s) {
  return s.split(',')
    .map((v) => v.split('='))
    .reduce((o, v) => {
      o[v[0]] = v[1]
      return o
    }, {})
}

document.querySelector('button[name=execute]').addEventListener('click', () => {
  if (poll != null) {
    poll.end()
    poll = null
  }

  poll = watch({
    host: document.querySelector('input[name=elasticsearch]').value,
    taskId: document.querySelector('input[name=taskid]').value
  })
})

each(parseOpts(window.location.hash.substr(1)), function (v, k) {
  var el
  if ((el = document.querySelector('input[name=' + k + ']')) != null) {
    el.value = v;
  }
})
