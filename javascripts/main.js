const COINGECKO = 'https://api.coingecko.com/api/v3';
const FEAR_GREED = 'https://api.alternative.me/fng/?limit=1';

function fmt(n) {
  if (n == null) return '--';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2) + 'M';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function fmtPrice(n) {
  if (n == null) return '--';
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1)    return '$' + n.toFixed(4);
  return '$' + n.toPrecision(4);
}

function fmtPct(n) {
  if (n == null) return '--';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function cls(n) {
  if (n == null) return '';
  return n >= 0 ? 'pos' : 'neg';
}

function set(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

async function fetchMarkets() {
  var url = COINGECKO + '/coins/markets?vs_currency=usd&order=market_cap_desc' +
            '&per_page=15&page=1&sparkline=false&price_change_percentage=7d';
  var r = await fetch(url);
  return r.json();
}

async function fetchGlobal() {
  var r = await fetch(COINGECKO + '/global');
  return r.json();
}

async function fetchFearGreed() {
  var r = await fetch(FEAR_GREED);
  return r.json();
}

function renderTable(coins) {
  var tbody = document.getElementById('market-tbody');
  if (!tbody) return;
  tbody.innerHTML = coins.map(function(c, i) {
    var ch24 = c.price_change_percentage_24h;
    var ch7  = c.price_change_percentage_7d_in_currency;
    return '<tr>' +
      '<td class="text-left rank">' + (i + 1) + '</td>' +
      '<td class="text-left"><div class="coin-cell">' +
        '<img src="' + c.image + '" alt="' + c.symbol + '" width="22" height="22">' +
        '<span class="cn">' + c.name + '</span>' +
        '<span class="cs">' + c.symbol.toUpperCase() + '</span>' +
      '</div></td>' +
      '<td class="price">' + fmtPrice(c.current_price) + '</td>' +
      '<td class="' + cls(ch24) + '">' + fmtPct(ch24) + '</td>' +
      '<td class="' + cls(ch7)  + '">' + fmtPct(ch7)  + '</td>' +
      '<td>' + fmt(c.market_cap)   + '</td>' +
      '<td>' + fmt(c.total_volume) + '</td>' +
    '</tr>';
  }).join('');
}

function renderCards(coins) {
  var btc = null, eth = null;
  for (var i = 0; i < coins.length; i++) {
    if (coins[i].id === 'bitcoin')  btc = coins[i];
    if (coins[i].id === 'ethereum') eth = coins[i];
  }
  if (btc) {
    set('btc-price', fmtPrice(btc.current_price));
    var btcEl = document.getElementById('btc-change');
    if (btcEl) {
      btcEl.textContent = fmtPct(btc.price_change_percentage_24h);
      btcEl.className = 'card-sub ' + cls(btc.price_change_percentage_24h);
    }
  }
  if (eth) {
    set('eth-price', fmtPrice(eth.current_price));
    var ethEl = document.getElementById('eth-change');
    if (ethEl) {
      ethEl.textContent = fmtPct(eth.price_change_percentage_24h);
      ethEl.className = 'card-sub ' + cls(eth.price_change_percentage_24h);
    }
  }
}

function renderGlobal(data) {
  if (!data || !data.data) return;
  var d   = data.data;
  var mcap = d.total_market_cap && d.total_market_cap.usd;
  var vol  = d.total_volume && d.total_volume.usd;
  var dom  = d.market_cap_percentage && d.market_cap_percentage.btc;
  set('total-mcap',  fmt(mcap));
  set('bar-mcap',    fmt(mcap));
  set('bar-vol',     fmt(vol));
  set('bar-btc-dom', dom != null ? dom.toFixed(1) + '%' : '--');
}

function renderFearGreed(data) {
  if (!data || !data.data || !data.data[0]) return;
  var fg = data.data[0];
  var v  = parseInt(fg.value, 10);
  set('fg-value', fg.value);
  set('fg-label', fg.value_classification);
  var el = document.getElementById('fg-value');
  if (el) el.className = 'card-value ' + (v <= 25 ? 'neg' : v >= 75 ? 'pos' : 'neutral');
}

async function refresh() {
  try {
    var results = await Promise.all([fetchMarkets(), fetchGlobal(), fetchFearGreed()]);
    renderTable(results[0]);
    renderCards(results[0]);
    renderGlobal(results[1]);
    renderFearGreed(results[2]);
    set('last-update', new Date().toLocaleTimeString('zh-CN'));
  } catch (e) {
    var tbody = document.getElementById('market-tbody');
    if (tbody && tbody.querySelector('.loading')) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading">数据加载失败，请刷新页面重试。</td></tr>';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  refresh();
  setInterval(refresh, 60000);
});
