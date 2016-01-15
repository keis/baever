import ESPoll from 'espoll'
import terminus from 'terminus'
import { Client } from 'elasticsearch'
import AnsiConvert from 'ansi-to-html'

const ansiConvert = new AnsiConvert({bg: 'none'})

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

  ep.pipe(terminus({objectMode: true}, (obj, enc, cb) => {
    var line = document.createElement('span')
    line.innerHTML = obj._source['@timestamp'] + ' ' + ansiConvert.toHtml(obj._source.message)
    el.appendChild(line)
    cb()
  }))
}

function parseOpts (s) {
  return s.split(',')
    .map((v) => v.split('='))
    .reduce((o, v) => {
      o[v[0]] = v[1]
      return o
    }, {})
}

if (window.location.hash) {
  watch(parseOpts(window.location.hash.substr(1)))
} else {
  document.body.innerHTML =
    '<h1>Configure elasticsearch host and taskId in url fragment</h1>' +
    '<code>#host=http://elasticsearch.local,taskId=sometask.id<code>'
}
