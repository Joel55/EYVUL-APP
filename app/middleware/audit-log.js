function audit(event, fields = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...fields }));
}

module.exports = { audit };
