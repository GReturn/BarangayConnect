(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();const $e="BarangayConnectDB",Be=1,w={residents:"residents",requests:"requests",ledger:"ledger",smsLog:"smsLog",offlineQueue:"offlineQueue"};let H=null;const L=new Map;function I(){return new Promise((e,t)=>{if(H){e(H);return}const a=indexedDB.open($e,Be);a.onupgradeneeded=n=>{const i=n.target.result;if(i.objectStoreNames.contains(w.residents)||i.createObjectStore(w.residents,{keyPath:"id"}),!i.objectStoreNames.contains(w.requests)){const s=i.createObjectStore(w.requests,{keyPath:"id"});s.createIndex("residentId","residentId",{unique:!1}),s.createIndex("status","status",{unique:!1}),s.createIndex("referenceNumber","referenceNumber",{unique:!0})}i.objectStoreNames.contains(w.ledger)||i.createObjectStore(w.ledger,{keyPath:"id"}).createIndex("requestId","requestId",{unique:!1}),i.objectStoreNames.contains(w.smsLog)||i.createObjectStore(w.smsLog,{keyPath:"id"}).createIndex("requestId","requestId",{unique:!1}),i.objectStoreNames.contains(w.offlineQueue)||i.createObjectStore(w.offlineQueue,{keyPath:"id"})},a.onsuccess=n=>{H=n.target.result,e(H)},a.onerror=n=>t(n.target.error)})}async function ve(e){const t=await I();return new Promise((a,n)=>{const o=t.transaction(e,"readonly").objectStore(e).getAll();o.onsuccess=()=>a(o.result),o.onerror=()=>n(o.error)})}async function ze(e,t){const a=await I();return new Promise((n,i)=>{const l=a.transaction(e,"readonly").objectStore(e).get(t);l.onsuccess=()=>n(l.result),l.onerror=()=>i(l.error)})}async function qe(e,t,a){const n=await I();return new Promise((i,s)=>{const r=n.transaction(e,"readonly").objectStore(e).index(t).getAll(a);r.onsuccess=()=>i(r.result),r.onerror=()=>s(r.error)})}async function me(e,t){const a=await I();return new Promise((n,i)=>{const l=a.transaction(e,"readwrite").objectStore(e).put(t);l.onsuccess=()=>{ie(e),n(l.result)},l.onerror=()=>i(l.error)})}async function Ee(e,t){const a=await I();return new Promise((n,i)=>{const l=a.transaction(e,"readwrite").objectStore(e).delete(t);l.onsuccess=()=>{ie(e),n()},l.onerror=()=>i(l.error)})}async function Ie(e){const t=await I();return new Promise((a,n)=>{const o=t.transaction(e,"readwrite").objectStore(e).clear();o.onsuccess=()=>{ie(e),a()},o.onerror=()=>n(o.error)})}async function Ce(e){const t=await I();return new Promise((a,n)=>{const o=t.transaction(e,"readonly").objectStore(e).count();o.onsuccess=()=>a(o.result),o.onerror=()=>n(o.error)})}function Te(e,t){return L.has(e)||L.set(e,new Set),L.get(e).add(t),()=>L.get(e).delete(t)}function ie(e){L.has(e)&&L.get(e).forEach(t=>{try{t()}catch(a){console.error("Subscriber error:",a)}})}async function Ae(){if((await ve(w.residents)).length>0)return;const t=[{id:"resident-001",name:"Maria Santos",firstName:"Maria",lastName:"Santos",address:"Purok 3, Barangay San Jose, Cebu City",dateOfBirth:"1990-05-15",phone:"+63 917 123 4567",age:36,isSenior:!1,isPWD:!1,isPregnant:!1,philsysId:"PSN-0001-2345-6789",philsysVerified:!0,role:"resident"},{id:"resident-002",name:"Juan dela Cruz",firstName:"Juan",lastName:"dela Cruz",address:"Purok 7, Barangay San Jose, Cebu City",dateOfBirth:"1962-11-22",phone:"+63 918 987 6543",age:63,isSenior:!0,isPWD:!1,isPregnant:!1,philsysId:"PSN-0002-6789-0123",philsysVerified:!0,role:"resident"},{id:"official-001",name:"KB Trongko",firstName:"KB",lastName:"Trongko",address:"Purok 1, Barangay San Jose, Cebu City",dateOfBirth:"1985-03-10",phone:"+63 919 555 1234",age:41,isSenior:!1,isPWD:!1,isPregnant:!1,philsysId:"PSN-0003-1111-2222",philsysVerified:!0,role:"official",officialTitle:"Barangay Secretary / Captain"}];for(const a of t)await me(w.residents,a);console.log("[Store] Demo data seeded")}const c={STORES:w,openDB:I,getAll:ve,getById:ze,getByIndex:qe,put:me,remove:Ee,clearStore:Ie,count:Ce,subscribe:Te,seedDemoData:Ae},{STORES:_}=c,Z="brgyconnect_session";let m=null,X=new Set;async function Re(){const e=localStorage.getItem(Z);if(e)try{const t=JSON.parse(e);m=await c.getById(_.residents,t.userId)}catch{localStorage.removeItem(Z)}m||(m=await c.getById(_.residents,"resident-001"),m&&be())}function be(){m&&localStorage.setItem(Z,JSON.stringify({userId:m.id,timestamp:Date.now()}))}async function je(e){return m=await c.getById(_.residents,e),m&&(be(),Ge()),m}function De(){return m}function Le(){return m&&m.role==="resident"}function Me(){return m&&m.role==="official"}function Pe(){return m?m.name.split(" ").map(t=>t[0]).join("").toUpperCase().substring(0,2):"?"}function Ne(){const e=new Date().getHours();return e<12?"Maayong buntag":e<18?"Maayong hapon":"Maayong gabii"}async function Oe(){return c.getAll(_.residents)}function He(e){return X.add(e),()=>X.delete(e)}function Ge(){X.forEach(e=>{try{e(m)}catch(t){console.error(t)}})}const b={init:Re,switchUser:je,getCurrentUser:De,isResident:Le,isOfficial:Me,getUserInitials:Pe,getGreeting:Ne,getAllUsers:Oe,onAuthChange:He},{STORES:R}=c;let E=navigator.onLine,ee=new Set,Y=!1;function Ue(){window.addEventListener("online",()=>{E=!0,U(),te()}),window.addEventListener("offline",()=>{E=!1,U()}),setInterval(async()=>{const e=E;E=navigator.onLine,e!==E&&(U(),E&&te())},5e3)}function _e(){return E}async function Qe(e){const t={id:`queue-${Date.now()}-${Math.random().toString(36).substr(2,6)}`,requestData:e,queuedAt:new Date().toISOString(),bleRelayAttempted:!1,bleRelaySuccess:!1,synced:!1};return await c.put(R.offlineQueue,t),setTimeout(async()=>{t.bleRelayAttempted=!0,t.bleRelaySuccess=!1,await c.put(R.offlineQueue,t)},2e3),t}async function Ve(){return(await c.getAll(R.offlineQueue)).filter(t=>!t.synced).length}async function he(){return(await c.getAll(R.offlineQueue)).filter(t=>!t.synced)}async function te(){if(!Y){Y=!0;try{const e=await he();for(const t of e){t.synced=!0,t.syncedAt=new Date().toISOString(),await c.put(R.offlineQueue,t);const a=await c.getById(R.requests,t.requestData.id);a&&a.status==="queued_offline"&&(a.status="submitted",a.syncedAt=t.syncedAt,await c.put(R.requests,a))}e.length>0&&U()}catch(e){console.error("[Offline] Sync error:",e)}finally{Y=!1}}}function Fe(e){return ee.add(e),()=>ee.delete(e)}function U(){ee.forEach(e=>{try{e(E)}catch(t){console.error(t)}})}const z={init:Ue,getStatus:_e,queueSubmission:Qe,getQueuedCount:Ve,getQueuedItems:he,autoSync:te,onStatusChange:Fe};function ae(){var r;const e=document.getElementById("navbar-root");if(!e)return;const t=b.getUserInitials(),a=b.isOfficial(),n=window.location.hash||"#/",i=!["#/","#","#/dashboard"].includes(n);e.innerHTML=`
    <!-- Top Header -->
    <nav class="navbar ${a?"navbar-official":"navbar-resident"}" id="main-navbar">
      <div class="navbar-inner">
        <div class="navbar-left">
          ${i?`
            <button class="nav-btn nav-back-btn" id="nav-back-button" aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
          `:`
            <button class="nav-btn nav-menu-btn" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          `}
        </div>

        <div class="navbar-center">
          <span class="navbar-title-text">
            ${a?"Official Portal":"BarangayConnect"}
          </span>
        </div>

        <div class="navbar-right">
          <div class="navbar-avatar-trigger" id="navbar-user-trigger">
            <div class="avatar-circle">${t}</div>
          </div>
          
          <div class="navbar-dropdown" id="navbar-dropdown">
            <div class="navbar-dropdown-header">Switch Account</div>
            <div id="navbar-user-list"></div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Bottom Navigation Bar -->
    <div class="bottom-nav ${a?"bottom-nav-official":"bottom-nav-resident"}">
      ${a?`
        <!-- Official Bottom Nav -->
        <a href="#/dashboard" class="bottom-nav-tab" id="tab-official-home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="bottom-nav-label">Home</span>
        </a>
        <a href="#/dashboard" class="bottom-nav-tab" id="tab-official-requests">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="bottom-nav-label">Requests</span>
        </a>
        <a href="#/sms-log" class="bottom-nav-tab" id="tab-official-logs">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span class="bottom-nav-label">Logs</span>
        </a>
        <button class="bottom-nav-tab btn-reset-tab" id="tab-official-profile">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="bottom-nav-label">Profile</span>
        </button>
      `:`
        <!-- Resident Bottom Nav -->
        <a href="#/" class="bottom-nav-tab" id="tab-resident-home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="bottom-nav-label">Balay / Home</span>
        </a>
        <a href="#/request" class="bottom-nav-tab" id="tab-resident-requests">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="bottom-nav-label">Mga Hangyo</span>
        </a>
        <a href="#/sms-log" class="bottom-nav-tab" id="tab-resident-bulletin">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M12 9v4"></path><path d="M12 16v.01"></path></svg>
          <span class="bottom-nav-label">Pahibalo</span>
        </a>
        <button class="bottom-nav-tab btn-reset-tab" id="tab-resident-profile">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="bottom-nav-label">Akawnt</span>
        </button>
      `}
    </div>
  `,(r=document.getElementById("nav-back-button"))==null||r.addEventListener("click",()=>{window.location.hash=a?"#/dashboard":"#/"}),Ke(),Ye();const s=document.getElementById("navbar-user-trigger"),o=document.getElementById(a?"tab-official-profile":"tab-resident-profile"),l=document.getElementById("navbar-dropdown"),d=u=>{u.stopPropagation(),l.classList.toggle("open")};s==null||s.addEventListener("click",d),o==null||o.addEventListener("click",d),document.addEventListener("click",()=>{l==null||l.classList.remove("open")}),We(a,n)}function We(e,t){var a,n,i,s,o,l,d;document.querySelectorAll(".bottom-nav-tab").forEach(r=>r.classList.remove("active")),e?t.startsWith("#/dashboard")?((a=document.getElementById("tab-official-home"))==null||a.classList.add("active"),(n=document.getElementById("tab-official-requests"))==null||n.classList.add("active")):t.startsWith("#/sms-log")?(i=document.getElementById("tab-official-logs"))==null||i.classList.add("active"):t.startsWith("#/review")&&((s=document.getElementById("tab-official-requests"))==null||s.classList.add("active")):t==="#/"||t==="#"?(o=document.getElementById("tab-resident-home"))==null||o.classList.add("active"):t.startsWith("#/request")||t.startsWith("#/status")?(l=document.getElementById("tab-resident-requests"))==null||l.classList.add("active"):t.startsWith("#/sms-log")&&((d=document.getElementById("tab-resident-bulletin"))==null||d.classList.add("active"))}async function Ye(){const e=await b.getAllUsers(),t=b.getCurrentUser(),a=document.getElementById("navbar-user-list");a&&(a.innerHTML=e.map(n=>`
    <button class="navbar-dropdown-item ${n.id===(t==null?void 0:t.id)?"active":""}" data-user-id="${n.id}" id="switch-user-${n.id}">
      <div class="avatar" style="width: 28px; height: 28px; font-size: 0.7rem;">${n.name.split(" ").map(i=>i[0]).join("").substring(0,2)}</div>
      <div>
        <div style="font-weight: 500; font-size: 0.8125rem; color: #111827;">${n.name}</div>
        <div style="font-size: 0.6875rem; color: var(--text-tertiary);">${n.role==="official"?n.officialTitle||"Official":"Resident"}${n.isSenior?" • Senior":""}</div>
      </div>
      ${n.id===(t==null?void 0:t.id)?'<span style="margin-left: auto; color: var(--color-accent-500); font-size: 0.75rem;">●</span>':""}
    </button>
  `).join(""),a.querySelectorAll(".navbar-dropdown-item").forEach(n=>{n.addEventListener("click",async()=>{const i=n.dataset.userId;await b.switchUser(i),window.location.hash=b.isOfficial()?"#/dashboard":"#/",window.location.reload()})}))}function Ke(){if(document.getElementById("navbar-styles"))return;const e=document.createElement("style");e.id="navbar-styles",e.textContent=`
    .navbar {
      position: sticky;
      top: 0;
      width: 100%;
      height: 54px;
      z-index: var(--z-sticky);
      border-bottom: 1px solid var(--border-default);
      transition: all 0.3s;
    }

    .navbar-resident {
      background: #ffffff;
      color: #0f4c81;
    }

    .navbar-official {
      background: #0e3e7d;
      color: #ffffff;
      border-bottom: none;
    }

    .navbar-inner {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-4);
    }

    .navbar-left, .navbar-right {
      display: flex;
      align-items: center;
      width: 44px;
    }

    .navbar-right {
      justify-content: flex-end;
      position: relative;
    }

    .navbar-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .navbar-title-text {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      letter-spacing: var(--letter-spacing-tight);
    }

    .navbar-official .navbar-title-text {
      color: #ffffff;
    }

    .nav-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2);
      border-radius: var(--radius-full);
      transition: background 0.2s;
    }

    .nav-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .navbar-official .nav-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .navbar-avatar-trigger {
      cursor: pointer;
    }

    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--gradient-accent);
      color: var(--text-on-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--font-size-sm);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Bottom Nav Styles */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 480px;
      height: 64px;
      background: #ffffff;
      border-top: 1px solid var(--border-default);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: var(--z-sticky);
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
      padding-bottom: env(safe-area-inset-bottom);
    }

    .bottom-nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      text-decoration: none;
      font-size: 10px;
      font-weight: 500;
      gap: 3px;
      flex: 1;
      height: 100%;
      border: none;
      background: none;
      cursor: pointer;
      font-family: var(--font-family);
      transition: color 0.2s;
    }

    .btn-reset-tab {
      padding: 0;
      margin: 0;
    }

    .bottom-nav-tab.active {
      color: #0f4c81;
    }

    .bottom-nav-tab:hover {
      color: #0f4c81;
    }

    .bottom-nav-label {
      font-size: 10px;
    }

    /* Dropdown Switcher */
    .navbar-dropdown {
      position: absolute;
      top: 40px;
      right: 0;
      width: 260px;
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all var(--duration-normal) var(--ease-out);
      overflow: hidden;
      z-index: var(--z-dropdown);
    }

    .navbar-dropdown.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .navbar-dropdown-header {
      padding: var(--space-3) var(--space-4);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      border-bottom: 1px solid var(--border-subtle);
    }

    .navbar-dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: none;
      border: none;
      color: #1f2937;
      cursor: pointer;
      text-align: left;
      font-family: var(--font-family);
      transition: background var(--duration-fast);
    }

    .navbar-dropdown-item:hover {
      background: #f3f4f6;
    }

    .navbar-dropdown-item.active {
      background: rgba(15, 76, 129, 0.08);
    }
  `,document.head.appendChild(e)}window.addEventListener("hashchange",()=>{ae()});let G=null;function le(){const e=document.getElementById("offline-banner-root");e&&(ce(e),z.onStatusChange(()=>ce(e)))}async function ce(e){var n;if(z.getStatus()){G&&(G.classList.add("hiding"),setTimeout(()=>{var i;e.innerHTML="",G=null,(i=document.getElementById("main-content"))==null||i.classList.remove("has-banner")},400));return}const a=await z.getQueuedCount();e.innerHTML=`
    <div class="offline-banner" id="offline-banner">
      <div class="offline-banner-inner">
        <div class="offline-banner-content">
          <span class="offline-banner-dot"></span>
          <span class="offline-banner-icon">📡</span>
          <span class="offline-banner-text">
            Offline — ${a>0?`${a} submission${a>1?"s":""} queued`:"walay internet connection"}
          </span>
        </div>
        <div class="offline-banner-ble">
          <span class="spinner" style="width: 12px; height: 12px; border-width: 1.5px;"></span>
          <span>BLE mesh scanning…</span>
        </div>
      </div>
    </div>
  `,G=document.getElementById("offline-banner"),(n=document.getElementById("main-content"))==null||n.classList.add("has-banner"),Je()}function Je(){if(document.getElementById("offline-banner-styles"))return;const e=document.createElement("style");e.id="offline-banner-styles",e.textContent=`
    .offline-banner {
      position: fixed;
      top: var(--navbar-height);
      left: 0;
      right: 0;
      height: var(--banner-height);
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%);
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
      z-index: var(--z-banner);
      animation: fadeInDown 0.4s var(--ease-out) both;
      display: flex;
      align-items: center;
    }

    .offline-banner.hiding {
      animation: fadeOut 0.3s var(--ease-out) both;
    }

    @keyframes fadeOut {
      to { opacity: 0; transform: translateY(-100%); }
    }

    .offline-banner-inner {
      max-width: var(--max-width);
      margin: 0 auto;
      width: 100%;
      padding: 0 var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .offline-banner-content {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-warning-300);
    }

    .offline-banner-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-warning-500);
      animation: pulse 2s ease-in-out infinite;
    }

    .offline-banner-icon {
      font-size: 1rem;
    }

    .offline-banner-ble {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-warning-400);
      opacity: 0.7;
    }

    @media (max-width: 640px) {
      .offline-banner-ble { display: none; }
    }
  `,document.head.appendChild(e)}let K=parseInt(localStorage.getItem("brgyconnect_req_counter")||"141",10);function Ze(){return K++,localStorage.setItem("brgyconnect_req_counter",K.toString()),`REQ-${new Date().getFullYear()}-${K.toString().padStart(5,"0")}`}function Xe(e="id"){return`${e}-${Date.now()}-${Math.random().toString(36).substr(2,8)}`}function ne(e){return new Date(e).toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0})}function et(e){return new Date(e).toISOString().replace("T"," ").replace(/\.\d+Z$/," UTC")}function se(e){const t=Math.floor((Date.now()-new Date(e).getTime())/1e3);if(t<60)return"just now";const a=Math.floor(t/60);if(a<60)return`${a}m ago`;const n=Math.floor(a/60);return n<24?`${n}h ago`:`${Math.floor(n/24)}d ago`}function tt(e,t={}){const a=[];return(e.isSenior||e.age>=60)&&a.push("Senior Citizen (60+)"),(e.isPWD||t.isPWD)&&a.push("PWD"),(e.isPregnant||t.isPregnant)&&a.push("Pregnant"),t.isSenior&&a.push("Senior Citizen (60+)"),{isPriority:a.length>0,reasons:[...new Set(a)]}}const at=[{value:"barangay_clearance",label:"Barangay Clearance"},{value:"indigency_certificate",label:"Indigency Certificate"},{value:"residency_certificate",label:"Certificate of Residency"},{value:"business_permit",label:"Barangay Business Permit"},{value:"cedula",label:"Community Tax Certificate (Cedula)"}];function M(e){const t=at.find(a=>a.value===e);return t?t.label:e}const nt={queued_offline:{label:"Queued (Offline)",color:"warning",icon:"📡"},submitted:{label:"Submitted",color:"accent",icon:"📋"},received:{label:"Received by Secretary",color:"accent",icon:"📨"},under_review:{label:"Under Review by Captain",color:"system",icon:"🔍"},approved:{label:"Approved",color:"success",icon:"✅"},rejected:{label:"Rejected",color:"error",icon:"❌"},ready_pickup:{label:"Ready for Pickup",color:"success",icon:"📦"},collected:{label:"Collected",color:"success",icon:"✓"}};function Q(e){return nt[e]||{label:e,color:"neutral",icon:"⚬"}}function it(){const e="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let t="";for(let a=0;a<8;a++)t+=e[Math.floor(Math.random()*e.length)],a===3&&(t+="-");return t}function st(){const e=new Date;return e.setHours(e.getHours()+48),e.toISOString()}function ye(e,t=120){const n=t/21;let i="";const s=ot(e),o=[];for(let d=0;d<441;d++)o.push((s[d%s.length]+d*7)%3===0);const l=(d,r)=>{o[d*21+r]=!0};for(let d=0;d<7;d++)for(let r=0;r<7;r++){const u=d===0||d===6||r===0||r===6,p=d>=2&&d<=4&&r>=2&&r<=4;(u||p)&&(l(d,r),l(d,14+r),l(14+d,r))}for(let d=0;d<21;d++)for(let r=0;r<21;r++)o[d*21+r]&&(i+=`<rect x="${r*n}" y="${d*n}" width="${n}" height="${n}" fill="#00c9a7" rx="1"/>`);return`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 ${t} ${t}" style="background:#0f1b2d;border-radius:8px;padding:8px">${i}</svg>`}function ot(e){const t=[];for(let a=0;a<e.length;a++)t.push(e.charCodeAt(a));for(;t.length<500;)t.push((t[t.length-1]*31+t[t.length-2]*17+7)%256);return t}function S(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let q=null;function F({title:e,body:t,actions:a=[],type:n="default",onClose:i=null}){var u;N();const s=document.getElementById("modal-root")||document.body,o=document.createElement("div");o.className="modal-backdrop",o.id="modal-backdrop";const l={default:"var(--color-accent-500)",warning:"var(--color-warning-500)",danger:"var(--color-error-500)",success:"var(--color-success-500)"},d=l[n]||l.default;o.innerHTML=`
    <div class="modal-container" id="modal-container">
      <div class="modal-accent-bar" style="background: ${d}"></div>
      <div class="modal-header">
        <h3 class="modal-title">${e}</h3>
        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close modal">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body">${t}</div>
      ${a.length>0?`
        <div class="modal-actions">
          ${a.map((p,v)=>`
            <button class="btn ${p.class||"btn-ghost"}" id="modal-action-${v}" data-action-index="${v}">
              ${p.label}
            </button>
          `).join("")}
        </div>
      `:""}
    </div>
  `,s.appendChild(o),q=o,requestAnimationFrame(()=>{o.classList.add("open")}),(u=document.getElementById("modal-close-btn"))==null||u.addEventListener("click",()=>{N(),i&&i()}),o.addEventListener("click",p=>{p.target===o&&(N(),i&&i())}),a.forEach((p,v)=>{var f;(f=document.getElementById(`modal-action-${v}`))==null||f.addEventListener("click",()=>{p.onClick&&p.onClick(),p.closeOnClick!==!1&&N()})});const r=p=>{p.key==="Escape"&&(N(),i&&i(),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r),rt()}function N(){q&&(q.classList.remove("open"),setTimeout(()=>{q&&q.parentNode&&q.parentNode.removeChild(q),q=null},300))}function rt(){if(document.getElementById("modal-styles"))return;const e=document.createElement("style");e.id="modal-styles",e.textContent=`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal-backdrop, 400);
      opacity: 0;
      transition: opacity 0.3s var(--ease-out);
      padding: var(--space-4);
    }

    .modal-backdrop.open {
      opacity: 1;
    }

    .modal-container {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl);
      max-width: 400px;
      width: 90%;
      overflow: hidden;
      transform: scale(0.95) translateY(8px);
      transition: transform 0.3s var(--ease-spring);
    }

    .modal-backdrop.open .modal-container {
      transform: scale(1) translateY(0);
    }

    .modal-accent-bar {
      height: 3px;
      width: 100%;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6) var(--space-2);
    }

    .modal-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }

    .modal-close-btn {
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      transition: all var(--duration-fast);
      display: flex;
    }

    .modal-close-btn:hover {
      background: var(--bg-surface);
      color: var(--text-primary);
    }

    .modal-body {
      padding: var(--space-4) var(--space-6);
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      line-height: var(--line-height-relaxed);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6) var(--space-5);
    }
  `,document.head.appendChild(e)}const pe="toast-container";function dt(){let e=document.getElementById(pe);return e||(e=document.createElement("div"),e.id=pe,e.style.cssText=`
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: var(--z-toast, 600);
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 380px;
      width: 100%;
      pointer-events: none;
    `,(document.getElementById("toast-root")||document.body).appendChild(e)),e}function $({type:e="info",title:t,message:a,duration:n=5e3}){const i=dt(),s={success:"✅",error:"❌",warning:"⚠️",info:"ℹ️",sms:"📱"},o={success:{bg:"rgba(16, 185, 129, 0.12)",border:"rgba(16, 185, 129, 0.3)",accent:"#10b981"},error:{bg:"rgba(239, 68, 68, 0.12)",border:"rgba(239, 68, 68, 0.3)",accent:"#ef4444"},warning:{bg:"rgba(245, 158, 11, 0.12)",border:"rgba(245, 158, 11, 0.3)",accent:"#f59e0b"},info:{bg:"rgba(0, 201, 167, 0.12)",border:"rgba(0, 201, 167, 0.3)",accent:"#00c9a7"},sms:{bg:"rgba(139, 92, 246, 0.12)",border:"rgba(139, 92, 246, 0.3)",accent:"#8b5cf6"}},l=o[e]||o.info,d=document.createElement("div");return d.className="toast-item",d.style.cssText=`
    background: ${l.bg};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${l.border};
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    pointer-events: auto;
    cursor: pointer;
    animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    transition: opacity 0.3s, transform 0.3s;
  `,d.innerHTML=`
    <span style="font-size: 1.2rem; line-height: 1; flex-shrink: 0;">${s[e]||s.info}</span>
    <div style="flex: 1; min-width: 0;">
      ${t?`<div style="font-size: 0.8125rem; font-weight: 600; color: ${l.accent}; margin-bottom: 2px;">${t}</div>`:""}
      <div style="font-size: 0.8125rem; color: rgba(255,255,255,0.8); line-height: 1.4;">${a}</div>
    </div>
    <button style="background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 1rem; padding: 0; line-height: 1; flex-shrink: 0;" aria-label="Close notification">&times;</button>
  `,d.addEventListener("click",()=>fe(d)),i.appendChild(d),n>0&&setTimeout(()=>fe(d),n),d}function fe(e){e.style.opacity="0",e.style.transform="translateX(100%)",setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},300)}const{STORES:lt}=c;async function xe(){var r,u,p,v;const e=document.getElementById("main-content");if(!e)return;const t=b.getCurrentUser(),a=b.getGreeting(),n=z.getStatus(),o=(await c.getAll(lt.requests)).filter(f=>f.residentId===(t==null?void 0:t.id)).filter(f=>!["collected","rejected"].includes(f.status)),l=await z.getQueuedCount(),d=n?[{tag:"Health",title:"Libre nga Medical Mission karong Sabado",desc:"Pag-andam sa inyong mga record para sa libre nga check-up sa Barangay Hall...",imageBg:"linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",imageEmoji:"🏥"},{tag:"Public Works",title:"Pag-ayo sa Dalan sa Purok 5",desc:"Temporaryo nga sirado ang dalan sugod ugma para sa pag-aspalto...",imageBg:"linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",imageEmoji:"🚧"}]:[{tag:"Community",title:"Oplan Limpyo sa Sitio Mahayahay",desc:"Nagkahiusa ang mga lumulupyo para sa paghinlo sa atong komunidad karong Sabado...",imageBg:"linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",imageEmoji:"🧹"},{tag:"Public Works",title:"Libreng Bakuna sa Barangay Hall",desc:"Hulat sa pag-sync (Waiting to sync...)",imageBg:"linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",imageEmoji:"💉",isPendingSync:!0}];e.innerHTML=`
    <div class="home-view animate-fade-in">
      
      <!-- Offline Banner (within Home View if queued) -->
      ${n?"":`
        <div class="home-offline-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.83-2.84M8.59 16.11a6 6 0 0 1 5.68-1.4M12 20h.01"></path></svg>
          <span>Offline — ${l} submission${l!==1?"s":""} queued</span>
        </div>
      `}

      <!-- Hero Greeting -->
      <div class="home-hero">
        <div class="home-hero-bg-building">
          <svg viewBox="0 0 100 60" width="100" height="60" opacity="0.15" fill="currentColor">
            <path d="M10 50h80V25L50 5 10 25v25zm15-10h12V28H25v12zm38 0h12V28H63v12zm-19 0h10V30H44v10zM5 50h90v5H5z"/>
          </svg>
        </div>
        <div class="home-greeting">
          <span class="home-greeting-label">${a}!</span>
          <h1 class="home-greeting-name">${t?t.name:"Residente"}</h1>
        </div>
        ${t!=null&&t.philsysVerified?`
          <div class="home-philsys-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Verified Resident</span>
          </div>
        `:""}
      </div>

      <!-- Section Title: Serbisyo -->
      <div class="section-header-compact">
        <h2 class="section-title-compact">Paspas nga Serbisyo</h2>
        <span class="section-subtitle-compact">Quick Actions</span>
      </div>

      <!-- Quick Actions Grid -->
      <div class="quick-actions-grid">
        <div class="quick-action-card" id="action-request-doc">
          <div class="quick-action-icon-wrapper blue-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div class="quick-action-texts">
            <div class="quick-action-title">Hangyo og Dokumento</div>
            <div class="quick-action-subtitle">Request Document</div>
          </div>
        </div>

        <div class="quick-action-card" id="action-track-status">
          <div class="quick-action-icon-wrapper blue-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          </div>
          <div class="quick-action-texts">
            <div class="quick-action-title">Subaya ang Status</div>
            <div class="quick-action-subtitle">Track Status</div>
          </div>
        </div>

        <div class="quick-action-card" id="action-barangay-id">
          <div class="quick-action-icon-wrapper gray-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="12" y2="16"></line></svg>
          </div>
          <div class="quick-action-texts">
            <div class="quick-action-title">Barangay ID</div>
            <div class="quick-action-subtitle">Digital ID Card</div>
          </div>
        </div>

        <div class="quick-action-card emergency-card" id="action-emergency">
          <div class="quick-action-icon-wrapper red-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.59 16.11a6 6 0 0 1 6.82 0M12 20h.01"></path></svg>
          </div>
          <div class="quick-action-texts">
            <div class="quick-action-title">Emergency</div>
            <div class="quick-action-subtitle">Immediate Help</div>
          </div>
        </div>
      </div>

      <!-- Active Requests (Feed Style) -->
      ${o.length>0?`
        <div class="section-header-compact">
          <h2 class="section-title-compact">Bag-ong Balita</h2>
          <span class="section-subtitle-compact">Recent Updates</span>
        </div>
        <div class="news-feed-list stagger">
          ${o.map(f=>ct(f)).join("")}
        </div>
      `:""}

      <!-- Section Title: News Bulletin -->
      <div class="section-header-compact mt-6">
        <h2 class="section-title-compact">${n?"Bag-ong Pahibalo":"Bag-ong Balita"}</h2>
        <a href="#/sms-log" class="section-action-link">Tan-awa Tanan</a>
      </div>

      <!-- Announcements List -->
      <div class="announcements-list stagger">
        ${d.map(f=>`
          <div class="news-bulletin-card card">
            <div class="news-bulletin-image" style="background: ${f.imageBg}">
              <span class="news-bulletin-emoji">${f.imageEmoji}</span>
              ${f.isPendingSync?`
                <div class="sync-badge">
                  <svg class="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                  <span>Syncing...</span>
                </div>
              `:""}
            </div>
            <div class="news-bulletin-content">
              <span class="news-bulletin-tag ${f.isPendingSync?"tag-warning":"tag-info"}">${f.tag.toUpperCase()}</span>
              <h3 class="news-bulletin-title">${f.title}</h3>
              <p class="news-bulletin-desc">${f.desc}</p>
            </div>
          </div>
        `).join("")}
      </div>

    </div>
  `,ut(),(r=document.getElementById("action-request-doc"))==null||r.addEventListener("click",()=>{window.location.hash="#/request"}),(u=document.getElementById("action-track-status"))==null||u.addEventListener("click",()=>{o.length>0?window.location.hash=`#/status/${o[0].id}`:window.location.hash="#/request"}),(p=document.getElementById("action-barangay-id"))==null||p.addEventListener("click",()=>{pt(t)}),(v=document.getElementById("action-emergency"))==null||v.addEventListener("click",()=>{ft()}),e.querySelectorAll(".news-feed-item").forEach(f=>{f.addEventListener("click",()=>{window.location.hash=`#/status/${f.dataset.requestId}`})})}function ct(e){const t=Q(e.status),a=M(e.documentType),n=se(e.createdAt);return`
    <div class="news-feed-item animate-fade-in-up" data-request-id="${e.id}">
      <div class="news-feed-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      </div>
      <div class="news-feed-content">
        <div class="news-feed-title-row">
          <span class="news-feed-title">${a} — <strong class="status-${t.color}">${t.label.toUpperCase()}</strong></span>
          <span class="news-feed-time">${n}</span>
        </div>
      </div>
      <div class="news-feed-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    </div>
  `}function pt(e){if(!e)return;const t=ye(e.philsysId||"BRGY-CONNECT",120);if(F({title:"Digital Barangay ID",type:"default",body:`
      <div class="digital-id-card">
        <div class="id-card-header">
          <div class="id-card-logo">🏠</div>
          <div class="id-card-title">
            <span class="id-card-title-main">BARANGAY GUADALUPE</span>
            <span class="id-card-title-sub">Official Digital Resident Card</span>
          </div>
        </div>
        <div class="id-card-body">
          <div class="id-card-avatar">${e.name.split(" ").map(a=>a[0]).join("").substring(0,2)}</div>
          <div class="id-card-info">
            <div class="id-card-info-item">
              <span class="id-label">FULL NAME</span>
              <span class="id-val">${e.name}</span>
            </div>
            <div class="id-card-info-item">
              <span class="id-label">RESIDENT ID</span>
              <span class="id-val" style="font-family: monospace;">${e.id.toUpperCase()}</span>
            </div>
            <div class="id-card-info-item">
              <span class="id-label">ADDRESS</span>
              <span class="id-val">${e.address}</span>
            </div>
          </div>
        </div>
        <div class="id-card-footer">
          <div class="id-card-qr">${t}</div>
          <div class="id-card-ver">
            <span class="id-ver-text">🛡️ Philsys Verified</span>
            <span class="id-ver-text text-secondary">Secured by GovChain OS</span>
          </div>
        </div>
      </div>
    `,actions:[{label:"Close",class:"btn-primary"}]}),!document.getElementById("id-card-styles")){const a=document.createElement("style");a.id="id-card-styles",a.textContent=`
      .digital-id-card {
        background: linear-gradient(135deg, #0e3e7d 0%, #1e40af 100%);
        color: #ffffff;
        border-radius: var(--radius-xl);
        padding: var(--space-4);
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .id-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        padding-bottom: var(--space-2);
      }
      .id-card-logo {
        font-size: 20px;
      }
      .id-card-title {
        display: flex;
        flex-direction: column;
      }
      .id-card-title-main {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .id-card-title-sub {
        font-size: 9px;
        opacity: 0.7;
      }
      .id-card-body {
        display: flex;
        gap: var(--space-4);
        align-items: center;
      }
      .id-card-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #ffffff;
        color: #0e3e7d;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 800;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }
      .id-card-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }
      .id-card-info-item {
        display: flex;
        flex-direction: column;
      }
      .id-label {
        font-size: 8px;
        opacity: 0.6;
        letter-spacing: 0.5px;
        font-weight: 600;
      }
      .id-val {
        font-size: var(--font-size-sm);
        font-weight: 600;
      }
      .id-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: var(--space-3);
      }
      .id-card-ver {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }
      .id-ver-text {
        font-size: 10px;
        font-weight: 600;
      }
      .id-card-qr svg {
        border: 1px solid rgba(255,255,255,0.1) !important;
        background: #0f1b2d !important;
      }
    `,document.head.appendChild(a)}}function ft(){F({title:"Trigger Emergency SOS?",type:"danger",body:`
      <p>This action will broadcast an **Immediate Help SOS** signal to Barangay Guadalupe response units.</p>
      <p style="margin-top: 10px; color: var(--color-error-500); font-weight: 600;">⚠️ Abuse of this system is strictly prohibited by law.</p>
    `,actions:[{label:"Cancel",class:"btn-ghost"},{label:"🚨 Call SOS Help",class:"btn-danger",onClick:()=>{$({type:"error",title:"Emergency Signal Sent!",message:"Response team dispatched. Please stay where you are.",duration:8e3})}}]})}function ut(){if(document.getElementById("home-styles"))return;const e=document.createElement("style");e.id="home-styles",e.textContent=`
    .home-offline-bar {
      background: #78350f;
      color: #fef3c7;
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-xs);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    
    .home-hero {
      background: linear-gradient(135deg, #0e3e7d 0%, #1d4ed8 100%);
      color: #ffffff;
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      position: relative;
      overflow: hidden;
      margin-bottom: var(--space-5);
      box-shadow: 0 4px 12px rgba(15, 76, 129, 0.15);
    }
    
    .home-hero-bg-building {
      position: absolute;
      bottom: 8px;
      right: 12px;
      color: #ffffff;
    }
    
    .home-greeting-label {
      font-size: var(--font-size-sm);
      opacity: 0.9;
      display: block;
      margin-bottom: 2px;
    }
    
    .home-greeting-name {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    
    .home-philsys-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.18);
      padding: 4px 8px;
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 600;
      margin-top: 12px;
      backdrop-filter: blur(4px);
    }

    .section-header-compact {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
    }

    .section-title-compact {
      font-size: var(--font-size-md);
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .section-subtitle-compact {
      font-size: 11px;
      color: var(--text-tertiary);
    }

    .section-action-link {
      font-size: 11px;
      font-weight: 600;
      color: #0f4c81;
    }

    /* Quick Actions */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }
    
    .quick-action-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .quick-action-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border-color: var(--border-strong);
    }
    
    .quick-action-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .quick-action-icon-wrapper.blue-bg {
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
    }
    
    .quick-action-icon-wrapper.gray-bg {
      background: rgba(107, 114, 128, 0.08);
      color: #4b5563;
    }
    
    .quick-action-icon-wrapper.red-bg {
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
    }
    
    .emergency-card:hover {
      border-color: #fca5a5;
      background: #fef2f2;
    }
    
    .quick-action-texts {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .quick-action-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: #1f2937;
    }
    
    .quick-action-subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }

    /* Request Feed */
    .news-feed-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }

    .news-feed-item {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .news-feed-item:hover {
      border-color: var(--border-strong);
      background: #f9fafb;
    }
    
    .news-feed-icon {
      color: #0f4c81;
      display: flex;
      align-items: center;
    }
    
    .news-feed-content {
      flex: 1;
    }
    
    .news-feed-title-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .news-feed-title {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: #1f2937;
    }
    
    .news-feed-title strong.status-success { color: #059669; }
    .news-feed-title strong.status-warning { color: #d97706; }
    .news-feed-title strong.status-accent { color: #0f4c81; }
    .news-feed-title strong.status-system { color: #7c3aed; }
    .news-feed-title strong.status-error { color: #dc2626; }
    
    .news-feed-time {
      font-size: 10px;
      color: var(--text-tertiary);
    }
    
    .news-feed-arrow {
      color: var(--text-tertiary);
    }

    /* Announcements Bulletin */
    .announcements-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .news-bulletin-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-default);
    }

    .news-bulletin-image {
      height: 120px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .news-bulletin-emoji {
      font-size: 36px;
    }

    .news-bulletin-content {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .news-bulletin-tag {
      align-self: flex-start;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
    }

    .tag-info {
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
    }

    .tag-warning {
      background: rgba(120, 53, 15, 0.08);
      color: #78350f;
    }

    .news-bulletin-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: #1f2937;
      margin: 0;
    }

    .news-bulletin-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      line-height: var(--line-height-normal);
      margin: 0;
    }

    .sync-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(120, 53, 15, 0.12);
      color: #78350f;
      padding: 3px 6px;
      border-radius: var(--radius-sm);
      font-size: 9px;
      font-weight: 600;
    }
  `,document.head.appendChild(e)}const{STORES:W}=c;async function oe(e){const a=new TextEncoder().encode(e),n=await crypto.subtle.digest("SHA-256",a);return Array.from(new Uint8Array(n)).map(s=>s.toString(16).padStart(2,"0")).join("")}async function gt(){const e=await c.getAll(W.ledger);return e.length===0?null:(e.sort((t,a)=>new Date(a.timestamp)-new Date(t.timestamp)),e[0])}async function vt({requestId:e,action:t,actor:a,remarks:n="",data:i={}}){const s=await gt(),o=s?s.hash:"0".repeat(64),l=new Date().toISOString(),d=`${o}|${t}|${l}|${e}|${a}|${JSON.stringify(i)}`,r=await oe(d),u={id:`ledger-${Date.now()}-${Math.random().toString(36).substr(2,6)}`,requestId:e,action:t,actor:a,remarks:n,timestamp:l,previousHash:o,hash:r,data:i};return await c.put(W.ledger,u),u}async function mt(e){const t=await c.getByIndex(W.ledger,"requestId",e);return t.sort((a,n)=>new Date(a.timestamp)-new Date(n.timestamp)),t}async function bt(){const e=await c.getAll(W.ledger);e.sort((t,a)=>new Date(t.timestamp)-new Date(a.timestamp));for(let t=0;t<e.length;t++){const a=e[t],n=t===0?"0".repeat(64):e[t-1].hash;if(a.previousHash!==n)return{valid:!1,brokenAt:t,entry:a};const i=`${a.previousHash}|${a.action}|${a.timestamp}|${a.requestId}|${a.actor}|${JSON.stringify(a.data||{})}`;if(await oe(i)!==a.hash)return{valid:!1,brokenAt:t,entry:a,reason:"hash_mismatch"}}return{valid:!0,count:e.length}}function ht(e){return{submitted:"Gi-submit ang hangyo",received:"Nadawat sa Secretary",under_review:"Gi-review sa Captain",approved:"Gi-approve",rejected:"Gi-reject",ready_pickup:"Andam na para kuhaon",collected:"Na-kuha na ang dokumento",collected_proxy:"Na-kuha sa proxy"}[e]||e}const j={appendEntry:vt,getEntriesForRequest:mt,validateChain:bt,formatAction:ht,computeHash:oe},{STORES:V}=c,we={submitted:e=>`BarangayConnect: Ang imong hangyo para sa ${e.documentType} na-submit na. Reference: ${e.referenceNumber}. Maghulat lang sa update.`,received:e=>`BarangayConnect: Ang imong hangyo ${e.referenceNumber} nadawat na sa Secretary. I-review kini sa labing madali.`,approved:e=>`BarangayConnect: Ang imong ${e.documentType} approved na. Pwede na nimong kuhaon sa Barangay Hall. Ref: ${e.referenceNumber}`,rejected:e=>`BarangayConnect: Pasensya, ang imong hangyo ${e.referenceNumber} wala ma-approve. Reason: ${e.remarks||"Wala'y gihatag nga rason."}`,ready_pickup:e=>`BarangayConnect: Ang imong ${e.documentType} andam na para kuhaon sa Barangay Hall. Dal-a ang imong QR code. Ref: ${e.referenceNumber}`,proxy_token:e=>`BarangayConnect: Proxy authorization token para sa ${e.documentType}: ${e.proxyToken}. I-present kini sa Barangay Hall. Valid hangtod ${e.tokenExpiry}.`,collected:e=>`BarangayConnect: Ang imong ${e.documentType} nakuha na. Ref: ${e.referenceNumber}. Salamat sa paggamit sa BarangayConnect!`,synced:e=>`BarangayConnect: Ang imong queued nga hangyo na-sync na. Reference: ${e.referenceNumber}. Ang imong hangyo naa na sa official queue.`};async function yt(e,t,a){const n=we[e];if(!n)return console.warn(`[SMS] Unknown template type: ${e}`),null;const i=n(a),s=await c.getById(V.residents,t),o={id:`sms-${Date.now()}-${Math.random().toString(36).substr(2,6)}`,requestId:a.requestId||a.id,recipientId:t,recipientName:s?s.name:"Unknown",recipientPhone:s?s.phone:"N/A",type:e,message:i,sentAt:new Date().toISOString(),status:"delivered"};return await c.put(V.smsLog,o),$({type:"sms",title:"SMS Notification",message:i.substring(0,120)+(i.length>120?"...":""),duration:6e3}),o}async function xt(){const e=await c.getAll(V.smsLog);return e.sort((t,a)=>new Date(a.sentAt)-new Date(t.sentAt)),e}async function wt(e){return c.getByIndex(V.smsLog,"requestId",e)}const D={sendSMS:yt,getSMSLog:xt,getSMSForRequest:wt,templates:we},{STORES:O}=c;async function kt(){const e=document.getElementById("main-content");if(!e)return;const t=b.getCurrentUser(),a=z.getStatus(),n=(t==null?void 0:t.id)==="resident-002"?"BRGY-GUA-2024-8891":`BRGY-GUA-${new Date().getFullYear()}-${(t==null?void 0:t.id.split("-")[1])||"9999"}`;e.innerHTML=`
    <div class="request-form-view animate-fade-in">
      
      <!-- Offline Banner -->
      ${a?"":`
        <div class="form-offline-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.83-2.84M8.59 16.11a6 6 0 0 1 5.68-1.4M12 20h.01"></path></svg>
          <span>Offline — request will submit when reconnected</span>
        </div>
      `}

      <div class="form-header">
        <h1>Hangyo sa Dokumento</h1>
        <p class="text-secondary mt-1">Document Request Form</p>
      </div>

      <form class="request-form card mt-4" id="request-form">
        <!-- Personal Info Pre-filled -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label font-bold flex items-center justify-between">
              Tibuok Ngalan (Full Name)
              <span class="badge badge-verified">🛡️ PhilSys Verified</span>
            </label>
            <input type="text" class="form-input prefilled" value="${t?S(t.name):""}" readonly disabled id="field-name" />
          </div>

          <div class="form-group mt-3">
            <label class="form-label font-bold">ID sa Residente (Resident ID)</label>
            <input type="text" class="form-input prefilled" value="${n}" readonly disabled id="field-resident-id" />
          </div>
        </div>

        <div class="divider"></div>

        <!-- Document Details -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label font-bold" for="field-doc-type">Klase sa Dokumento (Document Type) *</label>
            <select class="form-select" id="field-doc-type" required>
              <option value="">— Pilia ang klase sa dokumento —</option>
              <option value="barangay_clearance">Barangay Clearance</option>
              <option value="indigency_certificate">Indigency Certificate</option>
              <option value="residency_certificate">Residence Cert.</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label class="form-label font-bold" for="field-purpose">Katuyuan sa Hangyo (Purpose) *</label>
            <textarea class="form-textarea" id="field-purpose" placeholder="Ipasabot ang rason sa hangyo..." required></textarea>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Priority Requests -->
        <div class="form-section">
          <label class="form-label font-bold">Priority Request? <span>ℹ️</span></label>
          <div class="priority-banner mt-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            <span>Your request will be moved to the front of the queue.</span>
          </div>

          <div class="priority-checkbox-group">
            <label class="priority-check-item">
              <input type="checkbox" id="flag-pwd" ${t!=null&&t.isPWD?"checked":""} />
              <span class="custom-checkbox"></span>
              <span>PWD (Person with Disability)</span>
            </label>
            
            <label class="priority-check-item">
              <input type="checkbox" id="flag-senior" ${t!=null&&t.isSenior?"checked":""} />
              <span class="custom-checkbox"></span>
              <span>Senior Citizen (60+)</span>
            </label>
            
            <label class="priority-check-item">
              <input type="checkbox" id="flag-pregnant" ${t!=null&&t.isPregnant?"checked":""} />
              <span class="custom-checkbox"></span>
              <span>Pregnant / Mabdos</span>
            </label>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Proxy Claiming -->
        <div class="form-section">
          <div class="toggle-wrapper" id="proxy-toggle-wrapper">
            <span class="toggle-label font-bold">Ipa-kuha sa uban? (Proxy Claiming)</span>
            <div class="toggle" id="proxy-toggle"></div>
          </div>

          <div id="proxy-fields" class="mt-3" style="display: none;">
            <div class="form-group">
              <label class="form-label" for="field-proxy-name">Pangalan sa Proxy (Full name of proxy) *</label>
              <input type="text" class="form-input" id="field-proxy-name" placeholder="Pangalan sa proxy representative" />
            </div>
            
            <div class="form-group mt-3">
              <label class="form-label" for="field-proxy-relationship">Relasyon / Relationship *</label>
              <select class="form-select" id="field-proxy-relationship">
                <option value="">— Pilia ang relasyon —</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="relative">Relative</option>
                <option value="authorized">Authorized Representative</option>
              </select>
            </div>

            <div class="proxy-token-banner mt-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>A one-time token will be generated for your proxy.</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Submit Panel -->
        <div class="form-submit">
          <button type="submit" class="btn ${a?"btn-submit-request":"btn-queue-offline"} btn-lg w-full" id="submit-btn">
            ${a?"I-submit ang Request":"I-queue (Offline)"}
          </button>
          
          <div class="tamper-proof-footer-note mt-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Your submission will be logged in the barangay's tamper-proof ledger.</span>
          </div>
        </div>
      </form>

      <!-- Offline Info Blocks -->
      ${a?`
        <div class="online-info-banner notice notice-info mt-4">
          <span class="notice-icon">ℹ️</span>
          <div>
            <strong>Pahibalo:</strong> Palihug hulata ang 1-3 ka adlaw sa pagproseso sa imong hangyo. Makadawat ka og pahibalo kon kini andam na.
          </div>
        </div>
      `:`
        <div class="offline-info-container mt-4 stagger">
          <div class="offline-info-card card">
            <h4 class="offline-card-title">🔍 Offline Queueing</h4>
            <p class="offline-card-desc">Ang imong hangyo i-save sa app ug ipadala awtomatiko sa barangay inig balik sa internet.</p>
          </div>
          
          <div class="offline-info-card card mt-3">
            <div class="offline-card-header-with-img">
              <div class="offline-hall-placeholder">🏢</div>
              <div>
                <h4 class="offline-card-title">Brgy. Guadalupe Services</h4>
                <p class="offline-card-desc">Nagserbisyo kaninyo bisan wala'y internet connection. Priority namo ang inyong kasayon.</p>
              </div>
            </div>
          </div>

          <div class="offline-status-count-card card mt-3">
            <div class="offline-status-inner">
              <div class="offline-status-icon">📥</div>
              <div>
                <h5 class="offline-status-title">Pending Documents</h5>
                <p class="offline-status-desc">Naa kay <strong id="offline-pending-count">${queuedCount}</strong> ka hangyo nga nag-huwat sa connection.</p>
              </div>
            </div>
          </div>
        </div>
      `}
    </div>
  `,Bt(),St(t,a)}function St(e,t){var s,o;const a=document.getElementById("proxy-toggle"),n=document.getElementById("proxy-fields");let i=!1;(s=document.getElementById("proxy-toggle-wrapper"))==null||s.addEventListener("click",()=>{i=!i,a.classList.toggle("active",i),n.style.display=i?"block":"none"}),(o=document.getElementById("request-form"))==null||o.addEventListener("submit",async l=>{l.preventDefault(),await $t(e,t,i)})}async function $t(e,t,a){var C,B,h,k,x,T,P,g,A;const n=(C=document.getElementById("field-doc-type"))==null?void 0:C.value,i=(B=document.getElementById("field-purpose"))==null?void 0:B.value;if(!n||!i){$({type:"error",title:"Missing Fields",message:"Palihug pun-a ang required fields."});return}if(a){const y=(h=document.getElementById("field-proxy-name"))==null?void 0:h.value,Se=(k=document.getElementById("field-proxy-relationship"))==null?void 0:k.value;if(!y||!Se){$({type:"error",title:"Missing Proxy Info",message:"Palihug pun-a ang proxy name ug relationship."});return}}const s=document.getElementById("submit-btn");s.disabled=!0,s.innerHTML='<span class="spinner"></span> Processing...';const o=(x=document.getElementById("flag-senior"))==null?void 0:x.checked,l=(T=document.getElementById("flag-pwd"))==null?void 0:T.checked,d=(P=document.getElementById("flag-pregnant"))==null?void 0:P.checked,r=tt(e,{isSenior:o,isPWD:l,isPregnant:d}),u=a?it():null,p=a?st():null,v=Ze(),f={id:Xe("req"),referenceNumber:v,residentId:e.id,residentName:e.name,documentType:n,purpose:i,status:t?"submitted":"queued_offline",isPriority:r.isPriority,priorityReasons:r.reasons,isProxy:a,proxyName:a?(g=document.getElementById("field-proxy-name"))==null?void 0:g.value:null,proxyRelationship:a?(A=document.getElementById("field-proxy-relationship"))==null?void 0:A.value:null,proxyToken:u,proxyTokenExpiry:p,smsNotifications:!0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await c.put(O.requests,f),t?(await j.appendEntry({requestId:f.id,action:"submitted",actor:e.name,data:{referenceNumber:v,documentType:n}}),await D.sendSMS("submitted",e.id,{documentType:getDocumentTypeLabel(n),referenceNumber:v,requestId:f.id}),a&&u&&await D.sendSMS("proxy_token",e.id,{documentType:getDocumentTypeLabel(n),proxyToken:u,tokenExpiry:new Date(p).toLocaleString("en-PH"),requestId:f.id}),setTimeout(async()=>{const y=await c.getById(O.requests,f.id);y&&y.status==="submitted"&&(y.status="received",y.updatedAt=new Date().toISOString(),await c.put(O.requests,y),await j.appendEntry({requestId:f.id,action:"received",actor:"KB Trongko (Secretary)",data:{referenceNumber:v}}),await D.sendSMS("received",e.id,{referenceNumber:v,requestId:f.id}))},2e3),setTimeout(async()=>{const y=await c.getById(O.requests,f.id);y&&y.status==="received"&&(y.status="under_review",y.updatedAt=new Date().toISOString(),await c.put(O.requests,y),await j.appendEntry({requestId:f.id,action:"under_review",actor:"Admin K. Trongko (Captain)",data:{referenceNumber:v}}))},5e3)):await z.queueSubmission(f),$({type:"success",title:t?"Hangyo Na-submit!":"Na-queue ang Hangyo!",message:`Reference: ${v}`,duration:4e3}),setTimeout(()=>{window.location.hash=`#/status/${f.id}`},1e3)}function Bt(){if(document.getElementById("form-view-styles"))return;const e=document.createElement("style");e.id="form-view-styles",e.textContent=`
    .form-offline-bar {
      background: #78350f;
      color: #fef3c7;
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-xs);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .form-header h1 {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: #1f2937;
    }

    .request-form {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
    }

    .form-input.prefilled:disabled {
      background: #f3f4f6;
      border-color: var(--border-default);
      color: #374151;
      opacity: 0.9;
    }

    .priority-banner {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.15);
      color: #047857;
      border-radius: var(--radius-md);
      padding: 8px 12px;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .priority-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .priority-check-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: var(--font-size-sm);
      cursor: pointer;
      user-select: none;
    }

    .priority-check-item input[type="checkbox"] {
      display: none;
    }

    .custom-checkbox {
      width: 18px;
      height: 18px;
      border: 1.5px solid var(--border-strong);
      border-radius: var(--radius-sm);
      display: inline-block;
      position: relative;
      transition: all 0.2s;
    }

    .priority-check-item input:checked + .custom-checkbox {
      background: #0f4c81;
      border-color: #0f4c81;
    }

    .priority-check-item input:checked + .custom-checkbox::after {
      content: '✓';
      position: absolute;
      color: white;
      font-size: 11px;
      font-weight: bold;
      top: -1px;
      left: 3px;
    }

    .btn-submit-request {
      background: #0f4c81;
      color: #ffffff;
    }

    .btn-submit-request:hover {
      background: #0b3366;
    }

    .btn-queue-offline {
      background: #78350f;
      color: #ffffff;
    }

    .btn-queue-offline:hover {
      background: #5f2a0c;
    }

    .proxy-token-banner {
      background: rgba(15, 76, 129, 0.06);
      border: 1px solid rgba(15, 76, 129, 0.12);
      color: #0f4c81;
      border-radius: var(--radius-md);
      padding: 8px 12px;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .tamper-proof-footer-note {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
      font-size: 10px;
      color: var(--text-tertiary);
    }

    /* Offline cards styling */
    .offline-info-card {
      border: 1px solid var(--border-default);
      background: #ffffff;
      padding: var(--space-4);
    }

    .offline-card-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .offline-card-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    .offline-card-header-with-img {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .offline-hall-placeholder {
      font-size: 28px;
      width: 48px;
      height: 48px;
      background: #f3f4f6;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .offline-status-count-card {
      background: #fffbeb;
      border: 1px solid #fde8c3;
      padding: var(--space-3);
    }

    .offline-status-inner {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .offline-status-icon {
      font-size: 24px;
    }

    .offline-status-title {
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: #78350f;
      margin: 0 0 2px;
    }

    .offline-status-desc {
      font-size: var(--font-size-xs);
      color: #92400e;
      margin: 0;
    }

    .offline-status-desc strong {
      font-weight: 700;
    }
  `,document.head.appendChild(e)}const{STORES:J}=c;async function ke(e){var P;const t=document.getElementById("main-content");if(!t)return;const a=b.getCurrentUser(),i=(await c.getAll(J.requests)).filter(g=>g.residentId===(a==null?void 0:a.id));let s=null;if(e?s=await c.getById(J.requests,e):i.length>0&&(i.sort((g,A)=>new Date(A.createdAt)-new Date(g.createdAt)),s=i[0]),!s){t.innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">Wala pa'y mga hangyo</div>
        <p class="text-sm text-secondary">Wala ka'y gihangyo nga mga dokumento sa pagkakaron.</p>
        <button class="btn btn-primary mt-4" onclick="window.location.hash='#/request'">+ Bag-ong Hangyo</button>
      </div>
    `;return}Q(s.status);const o=M(s.documentType),l=await j.getEntriesForRequest(s.id),d=ye(s.referenceNumber,110);let r=0,u="Giproseso pa";s.status==="queued_offline"?(r=10,u="Gi-queue (Offline)"):s.status==="submitted"?(r=25,u="Gidawat na"):s.status==="received"?(r=50,u="Nadawat sa Sekretaryo"):s.status==="under_review"?(r=65,u="Giproseso pa"):["approved","ready_pickup","collected"].includes(s.status)?(r=100,u="Andam na"):s.status==="rejected"&&(r=100,u="Wala nadayon");const p=l[l.length-1],v=p?p.hash:"4e9c3e2f1g0h9i8j7k6l5m4n3o2p1q9r",f=[{id:"mock-req-1",documentType:"indigency_certificate",status:"received",createdAt:"2026-03-10T10:00:00Z",referenceNumber:"REQ-2026-00010",actionLabel:"Nakuha na ang dokumento >",customStatusClass:"status-success-chip",statusText:"Gidawat na"},{id:"mock-req-2",documentType:"street_repair",status:"rejected",createdAt:"2026-03-08T15:30:00Z",referenceNumber:"REQ-2026-00008",actionLabel:"Kulang sa impormasyon >",customStatusClass:"status-danger-chip",statusText:"Wala nadayon"},{id:"mock-req-3",documentType:"medical_assistance",status:"under_review",createdAt:"2026-03-12T08:15:00Z",referenceNumber:"REQ-2026-00012",actionLabel:"Gisusi ang mga attachment >",customStatusClass:"status-warning-chip",statusText:"Giproseso pa"}],C=[...i.filter(g=>g.id!==s.id)];t.innerHTML=`
    <div class="status-tracker-view animate-fade-in">
      
      <!-- Top Title -->
      <div class="status-tracker-header flex items-center justify-between">
        <div>
          <h1>Status sa Hangyo</h1>
          <p class="text-secondary mt-1">Subaya ang dagan sa imong mga gihangyo nga serbisyo.</p>
        </div>
      </div>

      <!-- Current Processing Request Card -->
      <div class="card active-tracker-card mt-4">
        <span class="active-tracker-label uppercase">KASALUKUYANG GINAPROSESO</span>
        <div class="active-tracker-row mt-2">
          <h2 class="active-tracker-title">${o}</h2>
          <span class="badge active-tracker-status-badge status-${s.status}">${u}</span>
        </div>
        
        <div class="progress-container mt-4">
          <div class="progress-header flex justify-between">
            <span class="progress-label">Dagan sa Hangyo</span>
            <span class="progress-percent">${r}% Natapos</span>
          </div>
          <div class="progress-bar-track mt-2">
            <div class="progress-bar-fill" style="width: ${r}%"></div>
          </div>
        </div>

        <!-- Horizontal Steps Summary -->
        <div class="progress-steps-row mt-4">
          <div class="progress-step-item ${r>=25?"step-done":""}">
            <div class="progress-step-dot-small">✓</div>
            <span class="progress-step-text">Nadawat</span>
          </div>
          <div class="progress-step-item ${r>=65?"step-done":r>=50?"step-active":""}">
            <div class="progress-step-dot-small">• • •</div>
            <span class="progress-step-text">Gisusi</span>
          </div>
          <div class="progress-step-item ${r===100?"step-done":""}">
            <div class="progress-step-dot-small">⚙️</div>
            <span class="progress-step-text">Andam na</span>
          </div>
        </div>
      </div>

      <!-- Detail Timeline Vertical Steps -->
      <div class="card vertical-timeline-card mt-4">
        <h3 class="font-bold mb-4">Status sa Request</h3>
        
        <div class="timeline-request-details mb-4">
          <div class="timeline-detail-row">
            <span class="detail-lbl">Document Type</span>
            <span class="detail-val font-semibold">${o}</span>
          </div>
          <div class="timeline-detail-row mt-2">
            <span class="detail-lbl">Request ID</span>
            <span class="detail-val font-bold" style="font-family: monospace;">${s.referenceNumber}</span>
          </div>
          <div class="timeline-detail-row mt-2">
            <span class="detail-lbl">Date Filed</span>
            <span class="detail-val">${ne(s.createdAt)}</span>
          </div>
        </div>

        <div class="vertical-timeline">
          <!-- Step 1: Gi-submit -->
          <div class="timeline-node step-completed">
            <div class="timeline-node-dot">✓</div>
            <div class="timeline-node-content">
              <span class="timeline-node-title">Gi-submit</span>
              <span class="timeline-node-desc">Submitted — ${ne(s.createdAt)}</span>
            </div>
          </div>

          <!-- Step 2: Nadawat sa Sekretaryo -->
          <div class="timeline-node ${r>=50?"step-completed":"step-pending"}">
            <div class="timeline-node-dot">${r>=50?"✓":"2"}</div>
            <div class="timeline-node-content">
              <span class="timeline-node-title">Nadawat sa Sekretaryo</span>
              <span class="timeline-node-desc">${r>=50?"Received by Secretary":"Hulat sa secretary sa pagdawat"}</span>
            </div>
          </div>

          <!-- Step 3: Gi-review sa Kapitan -->
          <div class="timeline-node ${r>=100?"step-completed":r===65?"step-active":"step-pending"}">
            <div class="timeline-node-dot">${r>=100?"✓":"3"}</div>
            <div class="timeline-node-content">
              <span class="timeline-node-title">Gi-review sa Kapitan</span>
              <span class="timeline-node-desc">${r>=100?"Approved and Signed":r===65?"Under Review":"Hulat sa review sa kapitan"}</span>
            </div>
          </div>

          <!-- Step 4: Andam na Kuhaon -->
          <div class="timeline-node ${r===100?"step-completed":"step-pending"}">
            <div class="timeline-node-dot">📦</div>
            <div class="timeline-node-content">
              <span class="timeline-node-title">Andam na Kuhaon</span>
              <span class="timeline-node-desc">Ready for Pickup</span>
            </div>
          </div>
        </div>

        <!-- QR Code Block for pickup (only if approved/ready) -->
        ${["approved","ready_pickup","collected"].includes(s.status)?`
          <div class="pickup-qr-container mt-4">
            <div class="pickup-qr-box">${d}</div>
            <p class="pickup-qr-text mt-2 font-bold">I-pakita kini nga QR code sa Barangay Hall aron makuha ang dokumento.</p>
          </div>
        `:""}

        <div class="divider"></div>

        <!-- Tamper-proof record collapse -->
        <div class="tamper-proof-collapse" id="tamper-proof-toggle">
          <div class="tamper-proof-trigger">
            <span class="font-bold flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Tamper-proof Record
            </span>
            <svg class="chevron-icon" id="ledger-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="tamper-proof-details mt-3" id="ledger-details" style="display: none;">
            <div class="ledger-field">
              <span class="ledger-field-lbl">TRANSACTION HASH</span>
              <span class="ledger-field-val font-semibold" style="font-family: monospace; font-size: 10px; word-break: break-all;">${v}</span>
            </div>
            <p class="ledger-subtext mt-2">Kini nga hangyo natala sa tamper-proof ledger sa barangay alang sa integridad sa serbisyo.</p>
          </div>
        </div>

        <!-- SMS Notifications Toggle -->
        <div class="sms-notification-toggle-row mt-4">
          <div class="flex items-center justify-between w-full">
            <div>
              <span class="font-semibold block" style="font-size: var(--font-size-sm);">Ipahibalo ko kung andam na</span>
              <span class="text-xs text-secondary">Notify me when ready via SMS</span>
            </div>
            <div class="toggle ${s.smsNotifications?"active":""}" id="sms-toggle"></div>
          </div>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="status-filters-row mt-6">
        <button class="filter-chip active">Tanan</button>
        <button class="filter-chip">Gidawat na</button>
        <button class="filter-chip">Giproseso pa</button>
        <button class="filter-chip">Wala nadayon</button>
      </div>

      <!-- List of Other/Mock Requests -->
      <div class="requests-history-list mt-4 stagger">
        <!-- DB requests -->
        ${C.map(g=>{const A=Q(g.status),y=M(g.documentType);return`
            <div class="history-item card clickable-history-card" data-request-id="${g.id}">
              <div class="history-header">
                <span class="history-item-icon">📄</span>
                <div>
                  <h4 class="history-item-title">${y}</h4>
                  <span class="history-item-date">Gihangyo: ${se(g.createdAt)}</span>
                </div>
                <span class="badge history-badge badge-${A.color}">${A.label}</span>
              </div>
              <div class="history-action-link mt-2">
                <span>Subaya ang status ></span>
              </div>
            </div>
          `}).join("")}

        <!-- Mock requests to fill design -->
        ${f.map(g=>`
          <div class="history-item card" id="${g.id}">
            <div class="history-header">
              <span class="history-item-icon">${g.documentType==="street_repair"?"⚡":"📄"}</span>
              <div>
                <h4 class="history-item-title">${g.documentType==="street_repair"?"Streetlight Repair":g.documentType==="medical_assistance"?"Medical Assistance":"Indigency Certificate"}</h4>
                <span class="history-item-date">Gihangyo: Marso ${g.createdAt.split("-")[2].split("T")[0]}, 2026</span>
              </div>
              <span class="badge history-badge ${g.customStatusClass}">${g.statusText}</span>
            </div>
            <div class="history-action-link mt-2">
              <span>${g.actionLabel}</span>
            </div>
          </div>
        `).join("")}

        <!-- Add Request Floating / Bottom Button -->
        <button class="btn btn-ghost btn-lg w-full mt-4" id="btn-add-new-request">
          ➕ Bag-ong Hangyo
        </button>
      </div>

    </div>
  `,zt();const B=document.getElementById("tamper-proof-toggle"),h=document.getElementById("ledger-details"),k=document.getElementById("ledger-chevron");let x=!1;B==null||B.addEventListener("click",()=>{x=!x,h.style.display=x?"block":"none",k.style.transform=x?"rotate(180deg)":"rotate(0deg)"});const T=document.getElementById("sms-toggle");T==null||T.addEventListener("click",async()=>{s.smsNotifications=!s.smsNotifications,await c.put(J.requests,s),T.classList.toggle("active",s.smsNotifications),$({type:"success",title:"SMS Settings Updated",message:s.smsNotifications?"Notifications enabled":"Notifications disabled"})}),t.querySelectorAll(".clickable-history-card").forEach(g=>{g.addEventListener("click",()=>{ke(g.dataset.requestId)})}),(P=document.getElementById("btn-add-new-request"))==null||P.addEventListener("click",()=>{window.location.hash="#/request"})}function zt(){if(document.getElementById("tracker-view-styles"))return;const e=document.createElement("style");e.id="tracker-view-styles",e.textContent=`
    .status-tracker-header h1 {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: #1f2937;
    }

    .active-tracker-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-4);
    }

    .active-tracker-label {
      font-size: 10px;
      color: var(--text-tertiary);
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .active-tracker-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .active-tracker-title {
      font-size: var(--font-size-md);
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .active-tracker-status-badge {
      font-weight: 600;
    }

    .active-tracker-status-badge.status-under_review {
      background: rgba(245, 158, 11, 0.08);
      color: #b45309;
      border: 1.5px solid rgba(245, 158, 11, 0.15);
    }

    .active-tracker-status-badge.status-submitted,
    .active-tracker-status-badge.status-received {
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
      border: 1.5px solid rgba(15, 76, 129, 0.15);
    }

    .active-tracker-status-badge.status-approved,
    .active-tracker-status-badge.status-ready_pickup {
      background: rgba(16, 185, 129, 0.08);
      color: #047857;
      border: 1.5px solid rgba(16, 185, 129, 0.15);
    }

    .progress-container {
      display: flex;
      flex-direction: column;
    }

    .progress-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .progress-percent {
      font-size: 11px;
      font-weight: 700;
      color: #0f4c81;
    }

    .progress-bar-track {
      height: 6px;
      background: #f3f4f6;
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: #0f4c81;
      border-radius: var(--radius-full);
      transition: width 0.4s ease-out;
    }

    .progress-steps-row {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid var(--border-default);
      padding-top: var(--space-3);
    }

    .progress-step-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-tertiary);
    }

    .progress-step-dot-small {
      font-size: 10px;
      font-weight: 700;
    }

    .progress-step-text {
      font-size: 10px;
      font-weight: 600;
    }

    .progress-step-item.step-done {
      color: #059669;
    }

    .progress-step-item.step-active {
      color: #b45309;
    }

    /* Vertical Timeline */
    .vertical-timeline-card {
      background: #ffffff;
      padding: var(--space-4);
    }

    .timeline-request-details {
      background: #f9fafb;
      padding: var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-default);
    }

    .timeline-detail-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
    }

    .detail-lbl {
      color: var(--text-tertiary);
    }

    .detail-val {
      color: #1f2937;
    }

    .vertical-timeline {
      position: relative;
      padding-left: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: var(--space-4);
    }

    .vertical-timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: var(--border-default);
    }

    .timeline-node {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .timeline-node-dot {
      position: absolute;
      left: -24px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid var(--border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: bold;
      z-index: 2;
    }

    .timeline-node.step-completed .timeline-node-dot {
      background: #059669;
      border-color: #059669;
      color: #ffffff;
    }

    .timeline-node.step-active .timeline-node-dot {
      background: #d97706;
      border-color: #d97706;
      color: #ffffff;
    }

    .timeline-node.step-pending .timeline-node-dot {
      color: var(--text-tertiary);
    }

    .timeline-node-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .timeline-node-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #1f2937;
    }

    .timeline-node.step-pending .timeline-node-title {
      color: var(--text-tertiary);
    }

    .timeline-node-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }

    /* Collapse Tamper-proof */
    .tamper-proof-collapse {
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      cursor: pointer;
      background: #f9fafb;
      transition: background 0.2s;
    }

    .tamper-proof-collapse:hover {
      background: #f3f4f6;
    }

    .tamper-proof-trigger {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #0f4c81;
      font-size: var(--font-size-sm);
    }

    .chevron-icon {
      transition: transform 0.2s;
    }

    .ledger-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ledger-field-lbl {
      font-size: 8px;
      color: var(--text-tertiary);
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .ledger-subtext {
      font-size: 10px;
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    .sms-notification-toggle-row {
      background: #f9fafb;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-3);
    }

    /* Filters chips */
    .status-filters-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .filter-chip {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-full);
      padding: 6px 14px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .filter-chip.active {
      background: #0f4c81;
      color: #ffffff;
      border-color: #0f4c81;
    }

    /* History item cards */
    .history-item {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-3);
      margin-top: 10px;
      display: flex;
      flex-direction: column;
    }

    .history-header {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .history-item-icon {
      font-size: 20px;
      width: 36px;
      height: 36px;
      background: #f3f4f6;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .history-item-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 2px;
    }

    .history-item-date {
      font-size: 10px;
      color: var(--text-tertiary);
    }

    .history-badge {
      margin-left: auto;
      font-weight: 600;
    }

    .history-badge.status-success-chip {
      background: rgba(16, 185, 129, 0.08);
      color: #047857;
      border: 1.5px solid rgba(16, 185, 129, 0.15);
    }

    .history-badge.status-danger-chip {
      background: rgba(239, 68, 68, 0.08);
      color: #b91c1c;
      border: 1.5px solid rgba(239, 68, 68, 0.15);
    }

    .history-badge.status-warning-chip {
      background: rgba(245, 158, 11, 0.08);
      color: #b45309;
      border: 1.5px solid rgba(245, 158, 11, 0.15);
    }

    .history-action-link {
      border-top: 1px solid var(--border-default);
      padding-top: 8px;
      margin-top: 8px;
      font-size: 11px;
      font-weight: 600;
      color: #0f4c81;
      cursor: pointer;
    }

    .pickup-qr-container {
      background: #f9fafb;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .pickup-qr-box {
      background: #ffffff;
      padding: 8px;
      border-radius: var(--radius-md);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .pickup-qr-text {
      font-size: 11px;
      color: var(--text-secondary);
      max-width: 240px;
    }
  `,document.head.appendChild(e)}const{STORES:qt}=c;async function Et(){var d,r,u;const e=document.getElementById("main-content");if(!e)return;const t=await c.getAll(qt.requests),a=t.filter(p=>!["approved","rejected","collected","ready_pickup","queued_offline"].includes(p.status)).sort((p,v)=>p.isPriority&&!v.isPriority?-1:!p.isPriority&&v.isPriority?1:new Date(p.createdAt)-new Date(v.createdAt)),n=a.length,i=t.filter(p=>["approved","collected","ready_pickup"].includes(p.status)&&new Date(p.updatedAt).toDateString()===new Date().toDateString()).length,s=1284+t.length,o=42+n,l=156+i;e.innerHTML=`
    <div class="official-dashboard-view animate-fade-in">
      
      <!-- Dashboard Top Banner -->
      <div class="dashboard-banner">
        <span class="banner-org">DUMALA SA MGA HANGYO</span>
        <h1 class="banner-title">Admin Dashboard</h1>
        <div class="banner-date-capsule mt-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
        </div>
      </div>

      <!-- Stats Cards Grid -->
      <div class="dashboard-stats-grid mt-4 stagger">
        <div class="stats-card card">
          <div class="stats-header flex justify-between">
            <span class="stats-label">Tanan nga Hangyo</span>
            <span class="stats-icon-box blue-sub">📊</span>
          </div>
          <div class="stats-value-row mt-2">
            <span class="stats-value">${s}</span>
            <span class="stats-trend font-bold">+12%</span>
          </div>
          <span class="stats-footer-text">Total Requests</span>
        </div>

        <div class="stats-card card">
          <div class="stats-header flex justify-between">
            <span class="stats-label">Nagpaabot pa</span>
            <span class="stats-icon-box orange-sub">📋</span>
          </div>
          <div class="stats-value-row mt-2">
            <span class="stats-value">${o}</span>
            <span class="stats-trend text-danger font-bold">Urgent</span>
          </div>
          <span class="stats-footer-text">Pending Approvals</span>
        </div>

        <div class="stats-card card">
          <div class="stats-header flex justify-between">
            <span class="stats-label">Naaprobahan na</span>
            <span class="stats-icon-box green-sub">✓</span>
          </div>
          <div class="stats-value-row mt-2">
            <span class="stats-value">${l}</span>
            <span class="stats-trend text-success font-bold">Last 24h</span>
          </div>
          <span class="stats-footer-text">Approved Today</span>
        </div>
      </div>

      <!-- Request Queue Header -->
      <div class="section-header-compact mt-6">
        <h2 class="section-title-compact">Queue sa Pag-aprobar</h2>
        <a href="#/dashboard" class="section-action-link" id="btn-view-all-queue">View All</a>
      </div>

      <!-- Priority Toggle -->
      <div class="queue-control-row flex items-center justify-between mt-2">
        <span class="queue-control-lbl font-semibold">REQUEST QUEUE</span>
        <div class="priority-toggle-wrapper flex items-center gap-2">
          <span class="text-xs text-secondary font-medium">Priority first</span>
          <div class="toggle active" id="queue-priority-toggle"></div>
        </div>
      </div>

      <!-- Request Queue List Card Stack -->
      <div class="request-queue-list mt-3 stagger">
        ${a.length>0?a.map(p=>It(p)).join(""):`
          <div class="empty-queue-card card flex flex-col items-center justify-center py-6">
            <span style="font-size: 2rem;">✅</span>
            <h4 class="font-bold mt-2 text-secondary">Walay pending requests</h4>
            <p class="text-xs text-tertiary">Ang tanang requests na-process na.</p>
          </div>
        `}
      </div>

      <!-- Document Insights Card -->
      <div class="document-insights-card card mt-4">
        <div class="insights-content-row">
          <div class="insights-texts">
            <h4 class="insights-title">Document Insights</h4>
            <p class="insights-desc mt-1">Barangay clearance requests are up 24% this week. Consider adjusting processing schedules.</p>
            <button class="btn btn-primary btn-sm mt-3" id="btn-view-insights">View Full Report</button>
          </div>
          <div class="insights-mini-chart">
            <svg viewBox="0 0 60 40" width="60" height="40">
              <rect x="5" y="25" width="8" height="15" fill="#e2e8f0" rx="1"/>
              <rect x="18" y="15" width="8" height="25" fill="#e2e8f0" rx="1"/>
              <rect x="31" y="20" width="8" height="20" fill="#e2e8f0" rx="1"/>
              <rect x="44" y="5" width="8" height="35" fill="#0f4c81" rx="1"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Today's Goal Card -->
      <div class="goal-progress-card card mt-4">
        <h4 class="goal-title uppercase font-bold text-center">TODAY'S GOAL</h4>
        <div class="goal-circle-wrapper mt-3 flex justify-center">
          <svg class="goal-ring" width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#f3f4f6" stroke-width="8" fill="none" />
            <circle cx="50" cy="50" r="40" stroke="#0f4c81" stroke-width="8" fill="none"
                    stroke-dasharray="251.2" stroke-dashoffset="37.68" stroke-linecap="round" />
            <text x="50" y="56" text-anchor="middle" font-weight="800" font-size="18" fill="#1f2937">85%</text>
          </svg>
        </div>
        <p class="goal-desc mt-2 text-center font-bold">20/24 Requests Processed</p>
      </div>

      <!-- Quick Action: Print Barangay Report -->
      <div class="print-report-card card mt-4">
        <span class="print-label uppercase">Quick Action</span>
        <h3 class="print-title mt-1">Print Barangay Report</h3>
        <button class="btn btn-ghost btn-lg w-full mt-3 flex items-center justify-center gap-2" id="btn-print-report">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Generate Monthly PDF
        </button>
      </div>

      <!-- Tamper-proof Ledger Log List Section -->
      <div class="ledger-logs-section card mt-4">
        <h3 class="font-bold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Tamper-proof Ledger
        </h3>
        <div class="ledger-log-timeline mt-3">
          <div class="ledger-log-node">
            <span class="ledger-log-dot"></span>
            <div class="ledger-log-content">
              <span class="ledger-log-title">Admin K. Tiongko approved Request #8821</span>
              <span class="ledger-log-sub font-semibold">ID: TXN-992-BA | 10:42 AM</span>
            </div>
          </div>
          <div class="ledger-log-node">
            <span class="ledger-log-dot dot-system"></span>
            <div class="ledger-log-content">
              <span class="ledger-log-title text-success">System integrity check passed</span>
              <span class="ledger-log-sub font-semibold">HASH: 4e9c...8f1a | 09:00 AM</span>
            </div>
          </div>
          <div class="ledger-log-node">
            <span class="ledger-log-dot dot-danger"></span>
            <div class="ledger-log-content">
              <span class="ledger-log-title">Admin S. Go rejected Request #8819</span>
              <span class="ledger-log-sub font-semibold">ID: TXN-990-CF | 08:31 AM</span>
            </div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm w-full mt-3" id="btn-blockchain-audit">View Full Blockchain Audit</button>
      </div>

      <!-- GovChain Footer -->
      <div class="govchain-footer mt-8 text-center pb-4">
        <div class="govchain-line flex items-center justify-center gap-2">
          <span class="govchain-icon">🛡️</span>
          <span class="govchain-text">BarangayConnect OS v2.4.0 • Secured by GovChain</span>
        </div>
        <div class="govchain-links mt-2 flex justify-center gap-4">
          <a href="#/dashboard" class="govchain-link">Privacy Policy</a>
          <a href="#/dashboard" class="govchain-link">Support Desk</a>
        </div>
      </div>

    </div>
  `,Ct(),e.querySelectorAll(".queue-item-card").forEach(p=>{p.addEventListener("click",()=>{window.location.hash=`#/review/${p.dataset.requestId}`})}),(d=document.getElementById("btn-print-report"))==null||d.addEventListener("click",()=>{$({type:"success",title:"Generating PDF",message:"Monthly report compiling. Download starting shortly."})}),(r=document.getElementById("btn-blockchain-audit"))==null||r.addEventListener("click",()=>{$({type:"success",title:"Ledger Audit Passed",message:"Verified 42 transaction hashes. Blockchain sequence intact."})}),(u=document.getElementById("btn-view-insights"))==null||u.addEventListener("click",()=>{$({type:"success",title:"Opening Insights",message:"Loading predictive metrics reports."})})}function It(e){const t=M(e.documentType),a=e.residentName.split(" ").map(s=>s[0]).join("").substring(0,2);let n="Response required within 6h",i=!1;return e.isPriority?(n="Escalates to Vice-Captain in 2h 14m",i=!0):(e.id.endsWith("2")||e.id.endsWith("4"))&&(n="Escalates to Vice-Captain in 4h 00m",i=!0),`
    <div class="queue-item-card card ${e.isPriority?"border-priority":"border-pending"}" data-request-id="${e.id}">
      <div class="queue-item-header flex items-center justify-between">
        <div class="flex items-center gap-2">
          ${e.isPriority?'<span class="badge badge-priority-card">PRIORITY</span>':""}
          ${e.isPriority?'<span class="badge badge-sector-card">SENIOR CITIZEN</span>':'<span class="badge badge-pending-card">PENDING</span>'}
        </div>
        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
      
      <div class="queue-item-resident mt-3 flex items-center gap-3">
        <div class="avatar" style="width: 32px; height: 32px; font-size: 0.7rem; background: var(--gradient-accent); color: white;">
          ${a}
        </div>
        <div class="queue-item-title-col">
          <h4 class="queue-item-resident-name font-bold">${S(e.residentName)}</h4>
          <span class="queue-item-doctype">${t}</span>
        </div>
      </div>

      <div class="queue-item-meta mt-3">
        ${e.isPriority?`
          <div class="queue-priority-reason">
            ✓ Auto-prioritized — Senior Citizen (60+)
          </div>
        `:""}
        <div class="queue-sla-alert ${i?"alert-danger":"alert-info"} mt-1">
          <span class="alert-icon">⚠️</span>
          <span>${n}</span>
        </div>
      </div>
    </div>
  `}function Ct(){if(document.getElementById("dashboard-view-styles"))return;const e=document.createElement("style");e.id="dashboard-view-styles",e.textContent=`
    .dashboard-banner {
      background: linear-gradient(135deg, #0e3e7d 0%, #1e40af 100%);
      color: #ffffff;
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      box-shadow: 0 4px 12px rgba(15, 76, 129, 0.15);
    }

    .banner-org {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      opacity: 0.7;
    }

    .banner-title {
      font-size: var(--font-size-xl);
      font-weight: 800;
      margin: 2px 0 0;
      color: #ffffff;
    }

    .banner-date-capsule {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.18);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 500;
      backdrop-filter: blur(4px);
    }

    /* Stats Grid */
    .dashboard-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
    }

    .stats-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
    }

    .stats-label {
      font-size: 9px;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stats-icon-box {
      font-size: 12px;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stats-icon-box.blue-sub { background: rgba(15, 76, 129, 0.08); color: #0f4c81; }
    .stats-icon-box.orange-sub { background: rgba(245, 158, 11, 0.08); color: #b45309; }
    .stats-icon-box.green-sub { background: rgba(16, 185, 129, 0.08); color: #047857; }

    .stats-value-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .stats-value {
      font-size: var(--font-size-lg);
      font-weight: 800;
      color: #1f2937;
    }

    .stats-trend {
      font-size: 9px;
    }

    .stats-footer-text {
      font-size: 8px;
      color: var(--text-tertiary);
      margin-top: 2px;
    }

    /* Queue Controls */
    .queue-control-row {
      border-bottom: 1.5px solid var(--border-default);
      padding-bottom: 8px;
    }

    .queue-control-lbl {
      font-size: 10px;
      color: var(--text-tertiary);
      letter-spacing: 0.5px;
    }

    /* Queue card items */
    .request-queue-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .queue-item-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-4);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transition: all 0.2s;
    }

    .queue-item-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }

    .queue-item-card.border-priority {
      border-left: 3px solid #dc2626;
    }

    .queue-item-card.border-pending {
      border-left: 3px solid #b45309;
    }

    .badge-priority-card {
      background: rgba(220, 38, 38, 0.08);
      color: #dc2626;
      border: 1px solid rgba(220, 38, 38, 0.15);
      font-size: 8px;
      padding: 1px 4px;
    }

    .badge-sector-card {
      background: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.15);
      font-size: 8px;
      padding: 1px 4px;
    }

    .badge-pending-card {
      background: rgba(180, 83, 9, 0.08);
      color: #b45309;
      border: 1px solid rgba(180, 83, 9, 0.15);
      font-size: 8px;
      padding: 1px 4px;
    }

    .queue-item-resident-name {
      font-size: var(--font-size-sm);
      color: #1f2937;
      margin: 0;
    }

    .queue-item-doctype {
      font-size: 11px;
      color: var(--text-tertiary);
    }

    .queue-priority-reason {
      font-size: 10px;
      color: #047857;
      font-weight: 500;
    }

    .queue-sla-alert {
      font-size: 9px;
      font-weight: 600;
      padding: 3px 6px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .queue-sla-alert.alert-danger {
      background: #fef2f2;
      color: #dc2626;
    }

    .queue-sla-alert.alert-info {
      background: #f0fdf4;
      color: #15803d;
    }

    /* Insights card */
    .document-insights-card {
      background: #ffffff;
      padding: var(--space-4);
      border: 1px solid var(--border-default);
    }

    .insights-content-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .insights-texts {
      flex: 1;
    }

    .insights-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .insights-desc {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    /* Goal card */
    .goal-progress-card {
      background: #ffffff;
      padding: var(--space-4);
      border: 1px solid var(--border-default);
    }

    .goal-title {
      font-size: 10px;
      color: var(--text-tertiary);
      letter-spacing: 0.5px;
    }

    .goal-circle-wrapper {
      position: relative;
    }

    .goal-desc {
      font-size: 11px;
      color: var(--text-secondary);
    }

    /* Print card */
    .print-report-card {
      background: #ffffff;
      padding: var(--space-4);
      border: 1px solid var(--border-default);
    }

    .print-label {
      font-size: 9px;
      color: var(--text-tertiary);
      letter-spacing: 0.5px;
      font-weight: 700;
    }

    .print-title {
      font-size: var(--font-size-md);
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    /* Ledger log lists */
    .ledger-logs-section {
      background: #111827;
      border: 1px solid #1f2937;
      color: #ffffff;
      padding: var(--space-4);
    }

    .ledger-logs-section h3 {
      color: #ffffff;
      font-size: var(--font-size-sm);
    }

    .ledger-log-timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      position: relative;
      padding-left: var(--space-4);
    }

    .ledger-log-timeline::before {
      content: '';
      position: absolute;
      left: 3px;
      top: 6px;
      bottom: 6px;
      width: 1.5px;
      background: #374151;
    }

    .ledger-log-node {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .ledger-log-dot {
      position: absolute;
      left: -20px;
      top: 5px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      border: 2px solid #111827;
      box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
    }

    .ledger-log-dot.dot-system {
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
    }

    .ledger-log-dot.dot-danger {
      background: #ef4444;
      box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
    }

    .ledger-log-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ledger-log-title {
      font-size: 11px;
      font-weight: 500;
      color: #e5e7eb;
    }

    .ledger-log-sub {
      font-size: 9px;
      color: #9ca3af;
    }

    /* Govchain footer */
    .govchain-footer {
      color: var(--text-tertiary);
    }

    .govchain-text {
      font-size: 10px;
      font-weight: 500;
    }

    .govchain-link {
      font-size: 10px;
      color: #0f4c81;
      font-weight: 600;
    }
  `,document.head.appendChild(e)}const{STORES:re}=c;async function de(e){var f,C,B;const t=document.getElementById("main-content");if(!t)return;const a=await c.getById(re.requests,e);if(!a){t.innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">Request not found</div>
        <button class="btn btn-ghost mt-4" onclick="window.location.hash='#/dashboard'">← Back to Dashboard</button>
      </div>
    `;return}const n=Q(a.status),i=M(a.documentType),s=await j.getEntriesForRequest(e),o=await D.getSMSForRequest(e),l=["approved","ready_pickup","collected"].includes(a.status),d=a.status==="rejected",r=new Date(a.createdAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),u=s[s.length-1],p=u?u.hash:"c4d3e2f1g0h9i8j7k6l5m4n3o2p1q9r9",v=u?u.previousHash:"b7e2a16d8c4f92a3e5b1c0d9f8e7a6b5";t.innerHTML=`
    <div class="official-review-view animate-fade-in">

      <!-- Status Header Banner -->
      ${l?`
        <div class="review-status-banner banner-success animate-fade-in-down">
          <span class="banner-status-icon">✓</span>
          <span>Approved — ${S(a.residentName)} notified via SMS</span>
        </div>
      `:""}

      ${d?`
        <div class="review-status-banner banner-danger animate-fade-in-down">
          <span class="banner-status-icon">❌</span>
          <span>Rejected — ${S(a.residentName)} notified via SMS</span>
        </div>
      `:""}

      <!-- Request Details Card -->
      <div class="card review-details-card mt-3">
        <div class="review-details-header flex justify-between items-start">
          <div>
            <h2 class="review-doc-title font-bold">${i}</h2>
            <span class="review-req-id block mt-1">Request ID: #${a.referenceNumber}</span>
          </div>
          <span class="badge review-status-badge status-${a.status}">${n.label.toUpperCase()}</span>
        </div>

        <div class="review-fields-grid mt-4">
          <div class="review-field-row">
            <span class="review-field-lbl">APPLICANT</span>
            <span class="review-field-val font-semibold">${S(a.residentName)}</span>
          </div>
          
          <div class="review-field-row mt-3">
            <span class="review-field-lbl">DATE FILED</span>
            <span class="review-field-val">${r}</span>
          </div>

          <div class="review-field-row mt-3">
            <span class="review-field-lbl">PURPOSE</span>
            <span class="review-field-val font-italic">"${S(a.purpose)}"</span>
          </div>
        </div>

        <!-- Remarks Section (only if not processed) -->
        ${!l&&!d?`
          <div class="divider"></div>
          <div class="form-group mt-2">
            <label class="form-label font-bold" for="review-remarks">Remarks (optional)</label>
            <span class="form-hint mb-2 block">Mga obserbasyon o pahinumdom</span>
            <textarea class="form-textarea" id="review-remarks" placeholder="Add a note for the resident or for the record..."></textarea>
          </div>

          <div class="esignature-alert-banner mt-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Your approval constitutes a legally binding digital signature under RA 8792 (E-Commerce Act). No physical signature or presence required.</span>
          </div>

          <!-- Approve/Reject buttons -->
          <div class="review-actions-row flex gap-3 mt-4">
            <button class="btn btn-approve-action w-full" id="btn-review-approve">I-approve</button>
            <button class="btn btn-reject-action w-full" id="btn-review-reject">I-reject</button>
          </div>
        `:""}
      </div>

      <!-- Image Attachments Section -->
      <div class="card review-attachments-card mt-4">
        <h3 class="font-bold mb-3">Attachments</h3>
        <div class="attachments-grid">
          <!-- Attachment Slot 1: Thumbnail -->
          <div class="attachment-slot slot-filled">
            <div class="attachment-thumb-icon">📄</div>
            <div class="attachment-thumb-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
          </div>
          
          <!-- Attachment Slot 2: Add plus -->
          <div class="attachment-slot slot-upload-dashed">
            <div class="upload-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <span class="upload-plus">+</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SMS Notification log block -->
      ${o.length>0?`
        <div class="review-sms-alert-card card mt-4">
          <div class="sms-alert-header flex items-center gap-2">
            <span class="sms-alert-icon">✉️</span>
            <div>
              <span class="sms-alert-title block">SMS Notification Sent</span>
              <span class="sms-alert-status">Delivered</span>
            </div>
          </div>
          <div class="sms-alert-body mt-3">
            <span class="sms-alert-phone block">Notification delivered to resident's registered number</span>
            <span class="sms-alert-phone font-bold mt-1">${S(((f=b.getCurrentUser())==null?void 0:f.phone)||"+63 917 123 4567")}</span>
            <div class="sms-message-bubble mt-3 font-italic">
              "${S(o[o.length-1].message)}"
            </div>
            <span class="sms-alert-time block mt-2">${new Date(o[o.length-1].sentAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})} — ${new Date(o[o.length-1].sentAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"})} UTC</span>
          </div>
        </div>
      `:""}

      <!-- Audit Trail Timeline Steps table -->
      <div class="card review-audit-card mt-4">
        <h3 class="font-bold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Audit Trail
        </h3>
        
        <div class="audit-trail-table-container mt-3">
          <table class="audit-trail-table w-full">
            <thead>
              <tr>
                <th></th>
                <th>STEP</th>
                <th>ACTION</th>
                <th>ACTOR</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              ${s.map((h,k)=>{let x="Request Submitted";return h.action==="received"?x="Received by Secretary":h.action==="under_review"?x="Reviewed by Captain":h.action==="approved"?x="Approved & Signed":h.action==="rejected"&&(x="Rejected"),`
                  <tr>
                    <td class="audit-dot-cell"><span class="audit-table-dot"></span></td>
                    <td class="font-semibold">${k+1}</td>
                    <td class="font-bold text-gray-900">${x}</td>
                    <td>${S(h.actor)}</td>
                    <td class="text-secondary font-medium">${et(h.timestamp).split(" ")[1]} UTC</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>

        <!-- Hash block at bottom -->
        <div class="audit-hash-block mt-4">
          <span class="hash-label block font-semibold" style="font-family: monospace; font-size: 10px; word-break: break-all; color: #047857;">
            ${v.substring(0,32)} HASH: ${p.substring(0,32)} — Verified ✓
          </span>
          <p class="hash-info mt-2">This audit trail is permanently recorded on the BarangayConnect tamper-proof ledger and cannot be modified by any official.</p>
        </div>
      </div>

    </div>
  `,jt(),(C=document.getElementById("btn-review-approve"))==null||C.addEventListener("click",()=>{var k;const h=((k=document.getElementById("review-remarks"))==null?void 0:k.value)||"";Tt(a,h)}),(B=document.getElementById("btn-review-reject"))==null||B.addEventListener("click",()=>{var k;const h=((k=document.getElementById("review-remarks"))==null?void 0:k.value)||"";Rt(a,h)})}function Tt(e,t){F({title:"Confirm Approval",type:"default",body:`
      <div class="confirm-modal-inner flex flex-col items-center text-center">
        <div class="confirm-icon-box">✓</div>
        <h3 class="confirm-title font-bold mt-3">Confirm Approval</h3>
        <p class="confirm-desc mt-2">This action will be recorded in the tamper-proof ledger and cannot be undone.</p>
      </div>
    `,actions:[{label:"Confirm",class:"btn-confirm-approve w-full",onClick:()=>At(e,t)},{label:"Cancel",class:"btn-confirm-cancel w-full"}]})}async function At(e,t){const a=b.getCurrentUser();e.status="approved",e.updatedAt=new Date().toISOString(),e.approvedBy=(a==null?void 0:a.name)||"Official",e.approvedAt=e.updatedAt,e.officialRemarks=t,await c.put(re.requests,e),await j.appendEntry({requestId:e.id,action:"approved",actor:(a==null?void 0:a.name)||"Official",remarks:t,data:{referenceNumber:e.referenceNumber,digitalSignature:`BC-LEDGER-RA8792-${Date.now()}`,documentType:e.documentType}}),await D.sendSMS("approved",e.residentId,{documentType:M(e.documentType),referenceNumber:e.referenceNumber,requestId:e.id}),$({type:"success",title:"Approved!",message:`${e.residentName} notified via SMS.`}),de(e.id)}async function Rt(e,t){F({title:"Reject Request?",type:"danger",body:`
      <p>Are you sure you want to reject the request from <strong>${S(e.residentName)}</strong>?</p>
      <p class="mt-2 text-sm text-secondary">This rejection will be recorded in the tamper-proof ledger.</p>
    `,actions:[{label:"Cancel",class:"btn-ghost"},{label:"❌ Reject",class:"btn-danger",onClick:async()=>{const a=b.getCurrentUser();e.status="rejected",e.updatedAt=new Date().toISOString(),e.rejectedBy=(a==null?void 0:a.name)||"Official",e.officialRemarks=t,await c.put(re.requests,e),await j.appendEntry({requestId:e.id,action:"rejected",actor:(a==null?void 0:a.name)||"Official",remarks:t,data:{referenceNumber:e.referenceNumber}}),await D.sendSMS("rejected",e.residentId,{referenceNumber:e.referenceNumber,remarks:t,requestId:e.id}),$({type:"error",title:"Rejected",message:`${e.residentName} notified.`}),de(e.id)}}]})}function jt(){if(document.getElementById("review-view-styles"))return;const e=document.createElement("style");e.id="review-view-styles",e.textContent=`
    .review-status-banner {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .review-status-banner.banner-success {
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .review-status-banner.banner-danger {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .banner-status-icon {
      font-size: 16px;
      font-weight: 800;
    }

    .review-details-card {
      background: #ffffff;
      padding: var(--space-4);
    }

    .review-doc-title {
      font-size: var(--font-size-md);
      color: #1f2937;
      margin: 0;
    }

    .review-req-id {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }

    .review-status-badge {
      font-weight: 600;
    }

    .review-status-badge.status-under_review {
      background: rgba(245, 158, 11, 0.08);
      color: #b45309;
      border: 1.5px solid rgba(245, 158, 11, 0.15);
    }

    .review-status-badge.status-submitted,
    .review-status-badge.status-received {
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
      border: 1.5px solid rgba(15, 76, 129, 0.15);
    }

    .review-status-badge.status-approved {
      background: rgba(16, 185, 129, 0.08);
      color: #047857;
      border: 1.5px solid rgba(16, 185, 129, 0.15);
    }

    .review-status-badge.status-rejected {
      background: rgba(239, 68, 68, 0.08);
      color: #b91c1c;
      border: 1.5px solid rgba(239, 68, 68, 0.15);
    }

    .review-field-lbl {
      font-size: 9px;
      color: var(--text-tertiary);
      font-weight: 700;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
    }

    .review-field-val {
      font-size: var(--font-size-sm);
      color: #1f2937;
      display: block;
    }

    .esignature-alert-banner {
      background: rgba(15, 76, 129, 0.06);
      border: 1px solid rgba(15, 76, 129, 0.12);
      color: #0f4c81;
      border-radius: var(--radius-md);
      padding: var(--space-3);
      font-size: 11px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-weight: 500;
      line-height: 1.4;
    }

    .esignature-alert-banner svg {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .btn-approve-action {
      background: #15803d;
      color: #ffffff;
    }

    .btn-approve-action:hover {
      background: #166534;
    }

    .btn-reject-action {
      background: #ffffff;
      border: 1.5px solid #dc2626;
      color: #dc2626;
    }

    .btn-reject-action:hover {
      background: #fef2f2;
    }

    /* Attachments styles */
    .review-attachments-card {
      background: #ffffff;
      padding: var(--space-4);
    }

    .attachments-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }

    .attachment-slot {
      height: 110px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .attachment-slot.slot-filled {
      background: #f3f4f6;
      border: 1px solid var(--border-default);
    }

    .attachment-thumb-icon {
      font-size: 28px;
    }

    .attachment-thumb-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .attachment-slot.slot-filled:hover .attachment-thumb-overlay {
      opacity: 1;
    }

    .attachment-slot.slot-upload-dashed {
      border: 2px dashed var(--border-strong);
      background: #ffffff;
      transition: background 0.2s;
    }

    .attachment-slot.slot-upload-dashed:hover {
      background: #f9fafb;
      border-color: #0f4c81;
    }

    .upload-icon-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-tertiary);
      position: relative;
    }

    .upload-plus {
      position: absolute;
      right: -8px;
      top: -8px;
      font-weight: 800;
      font-size: 16px;
      color: #0f4c81;
    }

    /* SMS Log Alert card */
    .review-sms-alert-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: var(--space-4);
    }

    .sms-alert-icon {
      font-size: 20px;
      color: #16803d;
    }

    .sms-alert-title {
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: #14532d;
    }

    .sms-alert-status {
      font-size: 9px;
      font-weight: 700;
      background: #dcfce7;
      color: #166534;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      border: 1px solid #bbf7d0;
    }

    .sms-alert-phone {
      font-size: 11px;
      color: #166534;
    }

    .sms-message-bubble {
      background: #ffffff;
      border: 1px solid #e6fcf0;
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-xs);
      color: #1f2937;
      line-height: 1.5;
    }

    .sms-alert-time {
      font-size: 9px;
      color: #15803d;
    }

    /* Audit Trail steps table */
    .review-audit-card {
      background: #ffffff;
      padding: var(--space-4);
    }

    .audit-trail-table-container {
      overflow-x: auto;
    }

    .audit-trail-table {
      border-collapse: collapse;
      font-size: var(--font-size-xs);
    }

    .audit-trail-table th {
      padding: var(--space-2) var(--space-3);
      color: var(--text-tertiary);
      font-weight: 700;
      text-align: left;
      border-bottom: 1px solid var(--border-default);
    }

    .audit-trail-table td {
      padding: var(--space-3) var(--space-3);
      border-bottom: 1.5px solid var(--border-subtle);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .audit-dot-cell {
      width: 14px;
      padding-right: 0 !important;
    }

    .audit-table-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #059669;
      display: inline-block;
    }

    .audit-hash-block {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-md);
      padding: var(--space-3);
    }

    .hash-info {
      font-size: 9px;
      color: #166534;
      line-height: 1.4;
      margin: 0;
    }

    /* Confirm Modal override */
    .confirm-modal-inner {
      padding: var(--space-2);
    }

    .confirm-icon-box {
      width: 48px;
      height: 48px;
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
    }

    .confirm-title {
      font-size: var(--font-size-md);
      color: #1f2937;
    }

    .confirm-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }

    .btn-confirm-approve {
      background: #0f4c81;
      color: #ffffff;
    }

    .btn-confirm-approve:hover {
      background: #0b3366;
    }

    .btn-confirm-cancel {
      background: #ffffff;
      border: 1px solid var(--border-default);
      color: var(--text-secondary);
    }

    .btn-confirm-cancel:hover {
      background: #f9fafb;
    }
  `,document.head.appendChild(e)}async function Dt(){var a;const e=document.getElementById("main-content");if(!e)return;const t=await D.getSMSLog();if(e.innerHTML=`
    <div class="sms-log-view animate-fade-in">
      <div class="form-back-row">
        <button class="btn btn-ghost btn-sm" id="sms-back-btn">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          Balik
        </button>
      </div>

      <div class="section-header">
        <div>
          <h1 style="font-size: var(--font-size-3xl);">📱 SMS Log</h1>
          <p class="text-secondary mt-1">Tanan mga SMS notifications nga na-send</p>
        </div>
        <span class="badge badge-neutral">${t.length} message${t.length!==1?"s":""}</span>
      </div>

      ${t.length>0?`
        <div class="flex flex-col gap-3 mt-6 stagger">
          ${t.map(n=>`
            <div class="card animate-fade-in-up" style="padding: var(--space-4) var(--space-5);">
              <div class="flex items-center justify-between mb-2" style="flex-wrap: wrap; gap: var(--space-2);">
                <div class="flex items-center gap-2">
                  <span class="badge badge-system">${n.type}</span>
                  <span class="font-medium text-sm">${S(n.recipientName)}</span>
                  <span class="text-xs text-tertiary">${n.recipientPhone}</span>
                </div>
                <span class="text-xs text-tertiary">${se(n.sentAt)}</span>
              </div>
              <div class="text-sm" style="color: var(--text-secondary); line-height: 1.6; padding: var(--space-2) var(--space-3); background: var(--bg-surface); border-radius: var(--radius-md);">
                ${S(n.message)}
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-tertiary">${ne(n.sentAt)}</span>
                <span class="badge badge-success text-xs">✓ Delivered</span>
              </div>
            </div>
          `).join("")}
        </div>
      `:`
        <div class="empty-state mt-8">
          <div class="empty-state-icon">📱</div>
          <div class="empty-state-title">Walay SMS messages</div>
          <p class="text-sm text-secondary">Ang mga SMS notifications mo-appear diri.</p>
        </div>
      `}
    </div>
  `,!document.getElementById("sms-log-styles")){const n=document.createElement("style");n.id="sms-log-styles",n.textContent=`
      .sms-log-view {
        max-width: 720px;
        margin: 0 auto;
      }
    `,document.head.appendChild(n)}(a=document.getElementById("sms-back-btn"))==null||a.addEventListener("click",()=>{window.location.hash="#/"})}const ue=new Map;function Lt(){ue.forEach(e=>clearInterval(e)),ue.clear()}const Mt=[{pattern:/^#?\/?$/,handler:()=>xe()},{pattern:/^#\/request$/,handler:()=>kt()},{pattern:/^#\/status\/(.+)$/,handler:e=>ke(e[1])},{pattern:/^#\/dashboard$/,handler:()=>Et()},{pattern:/^#\/review\/(.+)$/,handler:e=>de(e[1])},{pattern:/^#\/sms-log$/,handler:()=>Dt()}];function ge(e){Lt();const t=e||"#/";for(const a of Mt){const n=t.match(a.pattern);if(n){window.scrollTo({top:0,behavior:"instant"}),a.handler(n);return}}xe()}function Pt(){window.addEventListener("hashchange",()=>{ge(window.location.hash)}),ge(window.location.hash)}async function Nt(){var e;try{console.log("[BarangayConnect] Initializing..."),await c.openDB(),console.log("[BarangayConnect] Database ready"),await c.seedDemoData(),console.log("[BarangayConnect] Demo data seeded"),await b.init(),console.log("[BarangayConnect] Auth ready —",(e=b.getCurrentUser())==null?void 0:e.name),z.init(),console.log("[BarangayConnect] Offline manager ready"),ae(),le(),b.onAuthChange(()=>{ae()}),z.onStatusChange(()=>{le()}),Pt(),console.log("[BarangayConnect] Router started"),console.log("[BarangayConnect] ✅ App ready!")}catch(t){console.error("[BarangayConnect] Init error:",t),document.getElementById("main-content").innerHTML=`
      <div class="empty-state" style="padding-top: 120px;">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Something went wrong</div>
        <p class="text-sm text-secondary">${t.message}</p>
        <button class="btn btn-primary mt-4" onclick="window.location.reload()">Reload</button>
      </div>
    `}}Nt();
