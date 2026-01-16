import React, { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const BlockedScreen = ({ onReset }) => (
    <div className="fixed inset-0 bg-red-950 z-[9999] flex flex-col items-center justify-center text-white text-center p-4 font-sans animate-fade-in">
      <div className="bg-red-900/50 p-12 rounded-3xl border-4 border-red-600 shadow-2xl max-w-3xl backdrop-blur-sm">
        <div className="text-8xl mb-6">🚫</div>
        <h1 className="text-6xl font-black tracking-widest text-red-500 mb-2">ACCESS DENIED</h1>
        <h2 className="text-3xl font-bold text-white mb-8">SYSTEM SECURITY ALERT</h2>
        <p className="text-xl text-gray-200 mb-8 leading-relaxed">
          Your connection has been dropped by the Firewall due to suspicious activity.
        </p>
        <p className="mt-8 text-xs text-gray-500">CyberShop Security Defense System v2.0</p>

        {/* Nút Reset Demo (Chỉ dùng cho lúc Demo để gỡ nhanh) */}
        <button
            onClick={onReset}
            className="mt-8 text-xs text-red-400 hover:text-white border border-red-800 px-3 py-1 rounded"
        >
          [DEMO ONLY] Reset Local State
        </button>
      </div>
    </div>
);

// --- COMPONENT: MODAL CHI TIẾT PAYLOAD ---
const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;
  const parsePayload = (rawPayload) => {
    if (!rawPayload) return { raw: "No content" };
    if (rawPayload.includes("Action:") && rawPayload.includes("|")) {
      const parts = rawPayload.split(" | ");
      const data = { raw: rawPayload };
      parts.forEach(part => {
        if (part.startsWith("Action:")) data.action = part.replace("Action:", "").trim();
        if (part.startsWith("Input:")) data.input = part.replace("Input:", "").trim();
        if (part.startsWith("Response:")) {
          let resp = part.replace("Response:", "").trim();
          data.response = resp.replace(/\), Product/g, "),\nProduct");
        }
      });
      return data;
    }
    return { raw: rawPayload, isRaw: true };
  };

  const parsedData = parsePayload(log.payload);

  return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-gray-900 border border-gray-600 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-blue-400 font-mono">🔍 Deep Packet Inspection</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                  log.violationType === 'SQL_INJECTION'
                      ? 'bg-red-900/50 text-red-200 border-red-700'
                      : 'bg-blue-900/50 text-blue-200 border-blue-700'
              }`}>
                {log.violationType}
             </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
          </div>

          {/* Body (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">

            {/* 1. Metadata Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Timestamp</p>
                <p className="text-gray-200 font-mono text-sm">{new Date(log.timestamp).toLocaleTimeString()}</p>
                <p className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Source IP</p>
                <p className="text-blue-300 font-mono text-sm">{log.ipAddress}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Fingerprint</p>
                <p className="text-gray-400 font-mono text-xs truncate" title={log.fingerprint}>{log.fingerprint}</p>
              </div>
              <div className="col-span-2 md:col-span-3 mt-2 pt-2 border-t border-gray-700">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Target Endpoint</p>
                <p className="text-green-400 font-mono text-sm break-all">{log.endpoint}</p>
              </div>
            </div>

            {/* 2. Payload Content */}
            <div>
              <h4 className="text-gray-400 text-xs uppercase font-bold mb-3 border-l-2 border-blue-500 pl-2">Captured Traffic Data</h4>

              {parsedData.isRaw ? (
                  // Hiển thị dạng thô (cho log tấn công SQLi)
                  <div className="bg-red-950/30 border border-red-500/30 rounded p-4">
                    <p className="text-red-400 text-xs font-bold mb-2">MALICIOUS PAYLOAD DETECTED:</p>
                    <code className="text-red-200 font-mono text-sm break-all whitespace-pre-wrap block">
                      {parsedData.raw}
                    </code>
                  </div>
              ) : (
                  // Hiển thị dạng đẹp (cho log INFO)
                  <div className="space-y-4">
                    {/* ACTION */}
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 text-xs font-mono w-16 text-right">ACTION:</span>
                      <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded text-sm font-bold font-mono border border-blue-500/30">
                         {parsedData.action || "Unknown"}
                      </span>
                    </div>

                    {/* INPUT */}
                    <div className="flex gap-4">
                      <span className="text-gray-500 text-xs font-mono w-16 text-right pt-2">INPUT:</span>
                      <div className="flex-1 bg-black rounded border border-gray-700 p-3 relative group">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <pre className="text-yellow-300 font-mono text-sm whitespace-pre-wrap break-all mt-2">
                             {parsedData.input || "[]"}
                         </pre>
                      </div>
                    </div>

                    {/* RESPONSE */}
                    <div className="flex gap-4">
                      <span className="text-gray-500 text-xs font-mono w-16 text-right pt-2">OUTPUT:</span>
                      <div className="flex-1 bg-gray-800 rounded border border-gray-600 p-3">
                         <pre className="text-green-300 font-mono text-xs whitespace-pre-wrap break-all max-h-60 overflow-y-auto custom-scrollbar">
                             {parsedData.response || "No response data"}
                         </pre>
                      </div>
                    </div>
                  </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="bg-gray-800 p-4 shrink-0 flex justify-end gap-2 border-t border-gray-700">
            <button onClick={() => navigator.clipboard.writeText(log.payload)} className="text-gray-400 hover:text-white px-4 py-2 text-sm font-bold hover:bg-gray-700 rounded transition">
              Copy Raw
            </button>
            <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold text-sm shadow-lg shadow-blue-900/50 transition">
              Done
            </button>
          </div>
        </div>
      </div>
  );
};

// --- COMPONENT: ADMIN DASHBOARD (ROUTE RIÊNG) ---
const AdminDashboard = ({ baseUrl }) => {
  const [logs, setLogs] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logRes, blackRes] = await Promise.all([
          fetch(`${baseUrl}/api/admin/logs`),
          fetch(`${baseUrl}/api/admin/blacklist`)
        ]);
        const logData = await logRes.json();
        const blackData = await blackRes.json();

        setLogs(logData.reverse());
        setBlacklist(blackData);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [baseUrl]);

  const handleExit = () => {
    window.location.href = "/";
  };

  return (
      <div className="min-h-screen bg-gray-950 text-gray-200 font-sans p-6">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-wider">🛡️ SECURITY OPERATIONS CENTER</h1>
          </div>
          <button onClick={handleExit} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 transition">
            Exit to Shop
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden flex flex-col h-[80vh]">
              <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="font-bold text-blue-400">📡 LIVE TRAFFIC MONITOR</h2>
                <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded">{logs.length} Events</span>
              </div>

              <div className="overflow-auto flex-1 p-2">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-800 text-gray-400 sticky top-0">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Source IP</th>
                    <th className="p-3">Endpoint</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                  {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="p-3 font-mono text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3">
                          {log.violationType === 'SQL_INJECTION' ? (
                              <span className="bg-red-900/40 text-red-400 border border-red-900 px-2 py-0.5 rounded text-xs font-bold">CRITICAL</span>
                          ) : (
                              <span className="bg-green-900/40 text-green-400 border border-green-900 px-2 py-0.5 rounded text-xs font-bold">INFO</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-blue-300">{log.ipAddress}</td>
                        <td className="p-3 text-gray-400 text-xs truncate max-w-[150px]" title={log.endpoint}>{log.endpoint}</td>
                        <td className="p-3 text-center">
                          <button
                              onClick={() => setSelectedLog(log)}
                              className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1 rounded text-xs font-bold transition-all border border-blue-600/30"
                          >
                            🔍 Inspect
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Blacklist */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden flex flex-col h-[80vh]">
            <div className="bg-red-900/20 p-4 border-b border-red-900/30 flex justify-between items-center">
              <h2 className="font-bold text-red-400">⛔ ACTIVE FIREWALL BANS</h2>
              <span className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded">{blacklist.length} Bans</span>
            </div>
            <div className="overflow-auto flex-1 p-2">
              {blacklist.length === 0 ? (
                  <div className="text-center text-gray-600 mt-10">No active bans. System secure.</div>
              ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-800 text-gray-400 sticky top-0">
                    <tr>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Unblock Time</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                    {blacklist.map((item) => (
                        <tr key={item.id} className="bg-red-950/30">
                          <td className="p-3 font-mono font-bold text-red-300">{item.ipAddress}</td>
                          <td className="p-3 text-gray-500 text-xs">{new Date(item.unblockAt).toLocaleTimeString()}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
              )}
            </div>
          </div>
        </div>
        {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
      </div>
  );
};

const fetchWithTimeout = (url, options, timeout = 3000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), timeout)
    )
  ]);
};

function App() {
  const isAdminRoute = window.location.pathname === '/admin';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isVulnerable, setIsVulnerable] = useState(false);

  const [fingerprint, setFingerprint] = useState('');
  const [isBlocked, setIsBlocked] = useState(() => {
    return localStorage.getItem('isBlocked') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const baseUrl = "http://192.168.2.9:8080";

  const handleDetection = () => {
    console.warn("🚨 FIREWALL DETECTED BLOCKING CONNECTION!");
    localStorage.setItem('isBlocked', 'true');
    setIsBlocked(true);
  };

  const handleResetDemo = () => {
    localStorage.removeItem('isBlocked');
    setIsBlocked(false);
    window.location.reload();
  };

  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();
      setFingerprint(visitorId);
      console.log('Device Fingerprint:', visitorId);
    };
    setFp();
  }, []);

  // Load all products when logged in
  useEffect(() => {
    if (isAdminRoute || isBlocked) return;
    if (isLoggedIn && searchResults.length === 0) {
      loadAllProducts();
    }
  }, [isLoggedIn, isVulnerable]);

  const loadAllProducts = async () => {
    try {
      const endpoint = isVulnerable ? '/api/vulnerable/products' : '/api/secure/products';
      const apiUrl = `${baseUrl}${endpoint}?query=`;
      console.log(`🔐 Attempting Login via: ${apiUrl}`);
      const response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fingerprint
        }
      });

      const data = await response.json();
      console.log('📦 All Products Loaded:', data);

      setSearchResults(data || []);
      setRawResponse({
        requestUrl: apiUrl,
        data: data
      });
      setHasSearched(false);
    } catch (error) {
        console.error('Error loading products:', error);
        if (error.message === 'TIMEOUT' || error.message.includes('NetworkError')) {
          handleDetection();
        }
    }
  };

  // LOGIN - Classic SQL Injection Demo
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);

    const endpoint = isVulnerable ? '/api/vulnerable/login' : '/api/secure/login';
    const apiUrl = `${baseUrl}${endpoint}`;

    try {
      console.log(`🔐 Attempting Login via: ${apiUrl}`);
      const response = await fetchWithTimeout(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fingerprint
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          //mode: mode
        })
      });

      //const data = await response.json();
      const text = await response.text();
      //console.log('🔐 Login Response:', data);
      console.log('🔐 Login Response:', text);
      if (text.includes("Success") || text.includes("Welcome")) {
        setIsLoggedIn(true);
        setLoginError(null);
      } else {
        //setLoginError(data);
        setLoginError(text);
        // Show error popup for Error-Based SQL Injection demo
        // if (data.error) {
        //   //alert(`❌ Login Failed!\n\nError: ${data.error}\n\nMode: ${mode}`);
        //   alert(`ERROR`)
        //}
      }

    } catch (error) {
      console.error('Login Error:', error);
      if (error.message === 'TIMEOUT' || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        handleDetection();
      } else {
        setLoginError("Connection failed");
      }
    }
  };

  // SEARCH - Union-Based SQL Injection Demo
  const handleSearch = async (e) => {
    e.preventDefault();
    setHasSearched(true);
    setSearchError(null);

    //const mode = isVulnerable ? 'vulnerable' : 'secure';
    const query = searchQuery.trim();
    const endpoint = isVulnerable ? '/api/vulnerable/products' : '/api/secure/products';
    try {
      const apiUrl = `${baseUrl}${endpoint}?query=${encodeURIComponent(query)}`;

      console.log('🔍 Request:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fingerprint}
      });

      const data = await response.json();
      console.log('📦 Response:', data);

      setSearchResults(data || []);
      setRawResponse({
          requestUrl: apiUrl,
          data: data
      });

      // Show error popup for Error-Based SQL Injection demo
      // if (!data.success && data.error) {
      //   alert(`❌ Search Failed!\n\nError: ${data.error}\n\nMode: ${mode}\n\nQuery: ${query}`);
      //   setSearchError(data.error);
      // }

    } catch (error) {
      console.error('Search Error:', error);
      if (error.message === 'TIMEOUT' || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        handleDetection();
      }
    }
  };

  const handleModeToggle = () => {
    setIsVulnerable(!isVulnerable);
    setSearchResults([]);
    setRawResponse(null);
    setSearchQuery('');
    setHasSearched(false);
    setSearchError(null);
  };
  if (isBlocked) {
    return <BlockedScreen onReset={handleResetDemo} fingerprint={fingerprint} />;
  }
  if (isAdminRoute) {
    return <AdminDashboard baseUrl={baseUrl} />;
  }

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-blue-600 mb-2">🛒 CyberShop</h1>
              <p className="text-gray-600">SQL Injection Demo - Educational Purpose</p>
              <p className="text-xs text-gray-400 font-mono mt-2 bg-gray-100 p-1 rounded inline-block">
                Device ID: {fingerprint || 'Loading...'}
              </p>
            </div>

            {/* Security Mode Toggle */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">Security Mode</p>
                  <p className="text-sm text-gray-600">
                    {isVulnerable ? '🔴 Vulnerable - SQL Injection Enabled' : '🟢 Secure - Protected'}
                  </p>
                </div>
                <button
                  onClick={handleModeToggle}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    isVulnerable ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isVulnerable ? '🔴 VULNERABLE' : '🟢 SECURE'}
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">
                Login to Shop
              </button>
            </form>

            {loginError && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                <p className="text-red-700 font-semibold">❌ {loginError.message || 'Login failed'}</p>
                {loginError.error && (
                  <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                    {loginError.error}
                  </pre>
                )}
              </div>
            )}

            {/* Attack Hints */}
            {/*<div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">*/}
            {/*  <p className="text-sm font-bold text-yellow-800 mb-2">💡 Attack Hints:</p>*/}
            {/*  <p className="text-xs text-yellow-700 mb-1">*/}
            {/*    <strong>Classic SQL Injection:</strong>*/}
            {/*  </p>*/}
            {/*  <code className="text-xs bg-yellow-100 px-2 py-1 rounded block mb-2">*/}
            {/*    Username: ' OR 1=1 --*/}
            {/*  </code>*/}
            {/*  <p className="text-xs text-yellow-700 mb-1">*/}
            {/*    <strong>Error-Based SQL Injection:</strong>*/}
            {/*  </p>*/}
            {/*  <code className="text-xs bg-yellow-100 px-2 py-1 rounded block">*/}
            {/*    Username: '*/}
            {/*  </code>*/}
            {/*</div>*/}

            <p className="text-gray-500 text-center mt-6 text-sm">🔒 Educational Demo - Cyber Security Project</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN SHOP SCREEN
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-600">🛒 CyberShop</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                 ID: {fingerprint.substring(0, 8)}...
              </span>
              <span className="text-gray-600">Welcome, {loginUsername}</span>
              <button onClick={() => setIsLoggedIn(false)} className="text-red-600 hover:text-red-700 font-semibold">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Security Mode</h2>
              <p className="text-sm text-gray-600">
                {isVulnerable ? '🔴 Vulnerable - SQL Injection Enabled' : '🟢 Secure - Protected'}
              </p>
            </div>
            <button
              onClick={handleModeToggle}
              className={`px-6 py-3 rounded-lg font-bold transition-all shadow-md ${
                isVulnerable ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isVulnerable ? '🔴 VULNERABLE' : '🟢 SECURE'}
            </button>
          </div>

          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md">
                🔍 Search
              </button>
            </div>
          </form>

          {/* Attack Hints */}
          {isVulnerable && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <p className="text-sm font-bold text-yellow-800 mb-2">💡 Union-Based SQL Injection Hint:</p>
              <code className="text-xs bg-yellow-100 px-2 py-1 rounded block mb-2">
                ' UNION SELECT 0, username ||' : '|| password, 0 FROM users --
              </code>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {hasSearched && searchQuery ? `Search Results (${searchResults.length} items)` : 'Products'}
          </h2>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {searchResults.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-4xl">📦</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${
                        typeof item.price === 'string' && isNaN(item.price) ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {typeof item.price === 'number' ? `$${item.price}` : item.price}
                      </span>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600 text-lg">No results found</p>
            </div>
          ) : null}
        </div>

        {/* DEBUG CONSOLE */}
        {/*{rawResponse && (*/}
        {/*  <div className="bg-gray-900 rounded-lg p-6 shadow-xl">*/}
        {/*    <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">[ DEBUG CONSOLE - Server Response ]</h2>*/}

        {/*    <div className="bg-blue-900 rounded-lg p-3 mb-4">*/}
        {/*      <p className="text-blue-200 text-sm font-mono">*/}
        {/*        🔤 REQUEST:*/}
        {/*        <span className="text-white">GET {baseUrl}/api/search?q={rawResponse.query || searchQuery}&mode={isVulnerable ? 'vulnerable' : 'secure'}</span>*/}
        {/*        <span className="text-white">GET {baseUrl}/api/search?q={rawResponse.query || searchQuery}&mode={isVulnerable ? 'vulnerable' : 'secure'}</span>*/}
        {/*      </p>*/}
        {/*    </div>*/}

        {/*    <div className="bg-black rounded-lg p-4 overflow-x-auto">*/}
        {/*      <pre className="text-green-400 text-sm font-mono">{JSON.stringify(rawResponse, null, 2)}</pre>*/}
        {/*    </div>*/}

        {/*    {rawResponse.error && (*/}
        {/*      <div className="mt-4 p-3 bg-red-900 rounded-lg">*/}
        {/*        <p className="text-red-200 font-mono text-sm">⚠️ ERROR: {rawResponse.error}</p>*/}
        {/*        <p className="text-red-300 font-mono text-xs mt-1">Mode: {rawResponse.mode}</p>*/}
        {/*      </div>*/}
        {/*    )}*/}

        {/*    {rawResponse.data && Array.isArray(rawResponse.data) && rawResponse.data.some(item => typeof item.price === 'string' && isNaN(item.price)) && (*/}
        {/*      <div className="mt-4 p-3 bg-red-900 rounded-lg">*/}
        {/*        <p className="text-red-200 font-mono text-sm">🚨 WARNING: Suspicious data detected in results</p>*/}
        {/*        <p className="text-red-300 font-mono text-xs mt-1">Some "price" values are strings (possible user credentials leak)</p>*/}
        {/*      </div>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
    </div>
  );
}

export default App;