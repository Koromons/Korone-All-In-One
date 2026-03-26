// ==UserScript==
// @name         Korone All-in-One
// @namespace    https://tampermonkey.net/
// @version      1.0
// @description  Combines: Faster User Search, Better My Friends, Old Trades Checker, Enhanced Place Settings, Asset Downloader, Avatar Editor Tweaks, Rolify, Old Collectibles Page, Better Details, Better Profile, API Purchase, Sidebar Buttons+, Trade Notifier, Mass Trade Sender
// @author       cooper, dior, pythonplugin, r7kano, x, rolu, arz
// @match        *://*.pekora.zip/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_cookie
// @connect      www.pekora.zip
// @connect      pekora.zip
// @connect      koromons.xyz
// @connect      files.catbox.moe
// @connect      economy.roblox.com
// @connect      assetdelivery.roblox.com
// @connect      roblox.com
// @connect      rbxcdn.com
// @connect      akamaized.net
// @connect      *
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
// @run-at       document-idle
// @icon         https://files.catbox.moe/cyolc9.png
// @updateURL    https://raw.githubusercontent.com/Koromons/Korone-All-In-One/refs/heads/main/Korone%20All-In-One.js
// @downloadURL  https://raw.githubusercontent.com/Koromons/Korone-All-In-One/refs/heads/main/Korone%20All-In-One.js
// ==/UserScript==

(function () {
    'use strict';

    // ============================================================
    // Extension Manager — shared config + navbar UI
    // ============================================================

    const EXT_META = {
        1:  'Faster User Search',
        2:  'Better My Friends',
        3:  'Old Trades Checker',
        4:  'Enhanced Place Settings',
        5:  'Asset Downloader',
        6:  'Avatar Editor Tweaks',
        7:  'Rolify',
        8:  'Old Collectibles Page',
        9:  'Better Details',
        10: 'Better Profile',
        11: 'API Purchase',
        12: 'Sidebar Buttons+',
        13: 'Wardrobe',
        14: 'Catalog Item Value',
        15: 'Collectibles Value',
        16: 'Banned Profile Overlay',
        17: 'Trade Notifier',
        18: 'Mass Trade Sender',
        19: 'Import from Roblox',
        21: 'Trade Calculator',
        22: '2018 Users Search',
        23: 'Trade+',
    };

    function extEnabled(n) {
        const v = localStorage.getItem('korone_ext_' + n);
        return v === null ? true : v === 'true';
    }
    function extSet(n, val) {
        localStorage.setItem('korone_ext_' + n, String(val));
    }

    (function injectExtManager() {
        const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-2 .9-2 2v3.8h1.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg>`;
        const CHEVRON_R = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;
        const CHEVRON_D = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 9 12 15 6 9"/></svg>`;

        // ── Section definitions ──────────────────────────────────────
        const SECTIONS = [
            {
                id: 'ui',
                label: 'UI & Sidebar',
                color: '#a78bfa',
                exts: [12, 20], // 20 = Collapse Sidebar (virtual)
            },
            {
                id: 'trading',
                label: 'Trading',
                color: '#4f8ef7',
                exts: [3, 17, 18, 21, 23],
            },
            {
                id: 'social',
                label: 'Social',
                color: '#52c97a',
                exts: [1, 2, 7, 16, 22],
            },
            {
                id: 'catalog',
                label: 'Catalog & Items',
                color: '#f59e42',
                exts: [8, 9, 10, 14, 15],
            },
            {
                id: 'avatar',
                label: 'Avatar & Wardrobe',
                color: '#f472b6',
                exts: [6, 13],
            },
            {
                id: 'development',
                label: 'Development',
                color: '#fb7185',
                exts: [4, 5, 11, 19],
            },
        ];

        // Label for ext 20 (virtual collapse sidebar toggle)
        const EXT_LABELS = Object.assign({20: 'Collapse Sidebar'}, Object.fromEntries(Object.entries(EXT_META).map(([k,v])=>[+k,v])));

        // sidebarFeature = is the collapse button feature enabled
        // sidebarCollapsed = is the sidebar currently in icon-only mode
        function sidebarFeature()     { return GM_getValue('korone_sidebar_feature', false); }
        function setSidebarFeature(v) { GM_setValue('korone_sidebar_feature', v); }
        function sidebarCollapsed()   { return GM_getValue('korone_sidebar_collapsed', false); }
        function setSidebarCollapsed(v) { GM_setValue('korone_sidebar_collapsed', v); }

        function getSidebarCard() {
            // The sidebar is div[class*="card-"] that contains nav links
            for (const el of document.querySelectorAll('div[class*="card-"]')) {
                if (el.querySelector('a[class*="link-"]')) return el;
            }
            return null;
        }

        function applySidebarCollapse() {
            const card = getSidebarCard();
            if (!card) return;
            const collapsed = sidebarCollapsed();

            if (collapsed) {
                // Shrink sidebar to icon width
                card.style.setProperty('width', '44px', 'important');
                card.style.setProperty('min-width', '44px', 'important');
                card.style.setProperty('overflow', 'hidden', 'important');
                card.style.setProperty('transition', 'width 0.2s ease', 'important');

                // Hide name text labels (span[class*="name-"])
                card.querySelectorAll('span[class*="name-"]').forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
                // Hide count badges (99+, 12)
                card.querySelectorAll('span[class*="countWrapper-"], span[class*="count-"]').forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
                // Hide username text (keep avatar image)
                card.querySelectorAll('a[class*="username-"]').forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
                // Hide divider
                card.querySelectorAll('div[class*="divider-"]').forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
                // Hide upgrade button
                card.querySelectorAll('p[class*="upgrade"], a:has(p[class*="upgrade"])').forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
                // Center the nav links and username container
                card.querySelectorAll('a[class*="link-"], a[href*="/profile"] > div').forEach(el => {
                    el.style.setProperty('justify-content', 'center', 'important');
                });
                card.querySelectorAll('p[class*="linkEntry-"]').forEach(el => {
                    el.style.setProperty('justify-content', 'center', 'important');
                    el.style.setProperty('display', 'flex', 'important');
                    el.style.setProperty('align-items', 'center', 'important');
                });
                // Center the user avatar container
                card.querySelectorAll('div[class*="usernameContainer-"]').forEach(el => {
                    el.style.setProperty('justify-content', 'center', 'important');
                    el.style.setProperty('display', 'flex', 'important');
                    el.style.setProperty('padding', '4px 0', 'important');
                });
            } else {
                // Restore everything
                card.style.removeProperty('width');
                card.style.removeProperty('min-width');
                card.style.removeProperty('overflow');
                card.style.setProperty('transition', 'width 0.2s ease', 'important');

                card.querySelectorAll('span[class*="name-"], span[class*="countWrapper-"], span[class*="count-"], a[class*="username-"], div[class*="divider-"], p[class*="upgrade"], a:has(p[class*="upgrade"])').forEach(el => {
                    el.style.removeProperty('display');
                });
                card.querySelectorAll('a[class*="link-"], a[href*="/profile"] > div, p[class*="linkEntry-"], div[class*="usernameContainer-"]').forEach(el => {
                    el.style.removeProperty('justify-content');
                    el.style.removeProperty('display');
                    el.style.removeProperty('align-items');
                    el.style.removeProperty('padding');
                });
            }
        }

        const style = document.createElement('style');
        style.textContent = `
            #korone-ext-btn {
                display: flex; align-items: center; justify-content: center;
                width: 32px; height: 32px; cursor: pointer;
                color: #fff; opacity: 0.75; border: none; background: none;
                border-radius: 4px; flex-shrink: 0; transition: opacity 0.15s, background 0.15s;
                position: relative;
            }
            #korone-ext-btn:hover { opacity: 1; background: rgba(255,255,255,0.1); }
            #korone-ext-btn.korone-active { opacity: 1; background: rgba(79,142,247,0.18); color: #4f8ef7; }
            #korone-ext-overlay { display:none; position:fixed; inset:0; z-index:99998; }
            #korone-ext-overlay.open { display:block; }
            #korone-ext-panel {
                display:none; position:fixed;
                background:#16161f; border:1px solid #2a2a38;
                border-radius:10px;
                box-shadow:0 12px 40px rgba(0,0,0,0.65),0 2px 8px rgba(0,0,0,0.4);
                z-index:99999; width:260px; padding:0; font-family:inherit; overflow:hidden;
            }
            #korone-ext-panel.open { display:block; }
            #korone-ext-panel-header {
                display:flex; align-items:center; justify-content:space-between;
                padding:11px 14px 10px; border-bottom:1px solid #22222e; background:#1a1a27;
            }
            #korone-ext-panel-title {
                font-size:11px; font-weight:700; letter-spacing:0.5px;
                text-transform:uppercase; color:#8888aa;
            }
            #korone-ext-panel-user {
                display:flex; align-items:center; gap:7px;
                background:rgba(255,255,255,0.06); border-radius:20px;
                padding:3px 10px 3px 4px;
            }
            #korone-ext-panel-avatar {
                width:24px; height:24px; border-radius:50%;
                object-fit:cover; background:#2a2a3a; flex-shrink:0;
            }
            #korone-ext-panel-username { font-size:11px; font-weight:700; color:#fff; white-space:nowrap; }
            #korone-ext-rows {
                padding:4px 0; max-height:400px; overflow-y:auto; overflow-x:hidden;
                scrollbar-width:thin; scrollbar-color:#2a2a3a transparent;
            }
            #korone-ext-rows::-webkit-scrollbar { width:3px; }
            #korone-ext-rows::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:2px; }
            .korone-section-header {
                display:flex; align-items:center; justify-content:space-between;
                padding:8px 14px 5px; cursor:pointer; user-select:none;
                transition:background 0.1s;
            }
            .korone-section-header:hover { background:rgba(255,255,255,0.03); }
            .korone-section-label {
                font-size:9px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase;
            }
            .korone-section-chevron { color:#555577; transition:transform 0.2s; display:flex; align-items:center; }
            .korone-section-body { overflow:hidden; transition:max-height 0.2s ease; }
            .korone-ext-row {
                display:flex; align-items:center; justify-content:space-between;
                padding:5px 14px 5px 22px; gap:10px; cursor:default; transition:background 0.1s;
            }
            .korone-ext-row:hover { background:rgba(255,255,255,0.03); }
            .korone-ext-num { font-size:9px; font-weight:700; color:#333355; min-width:14px; text-align:right; flex-shrink:0; }
            .korone-ext-label {
                font-size:12px; color:#c0c0d8; flex:1;
                white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
                user-select:none; transition:color 0.15s,opacity 0.15s;
            }
            .korone-ext-label.off { color:#44445a; }
            .korone-ext-toggle {
                width:34px; height:18px; border-radius:999px; flex-shrink:0;
                cursor:pointer; position:relative; transition:background 0.2s; border:none;
            }
            .korone-ext-toggle::after {
                content:''; position:absolute; top:2px; left:2px;
                width:14px; height:14px; border-radius:50%;
                background:#fff; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.4);
            }
            .korone-ext-toggle.on  { background:#4f8ef7; }
            .korone-ext-toggle.off { background:#333350; }
            .korone-ext-toggle.on::after  { left:18px; }
            #korone-ext-footer {
                border-top:1px solid #22222e; padding:8px 14px; background:#1a1a27;
                display:flex; align-items:center; gap:6px;
            }
            #korone-ext-footer-dot { width:6px; height:6px; border-radius:50%; background:#52c97a; flex-shrink:0; }
            #korone-ext-footer-text { font-size:9px; color:#44445a; flex:1; }
            #korone-ext-reload {
                font-size:9px; font-weight:600; padding:3px 7px;
                border-radius:4px; border:1px solid #2a2a3a;
                background:transparent; color:#555577; cursor:pointer;
                font-family:inherit; transition:color 0.15s,border-color 0.15s;
            }
            #korone-ext-reload:hover { color:#aaaacc; border-color:#44445a; }
            #korone-sidebar-collapse-btn {
                position:fixed; bottom:24px; left:0;
                width:32px; height:28px; background:#2a2a3a; border:1px solid #3a3a4a;
                border-left:none; border-radius:0 6px 6px 0; cursor:pointer;
                display:none; align-items:center; justify-content:center;
                z-index:9999; color:#888; transition:background 0.15s,color 0.15s;
            }
            #korone-sidebar-collapse-btn.sb-visible { display:flex; }
            #korone-sidebar-collapse-btn:hover { background:#3a3a5a; color:#ccc; }
        `;
        document.head.appendChild(style);

        // ── Sidebar collapse button ─────────────────────────────────
        function updateCollapseBtn() {
            const btn = document.getElementById('korone-sidebar-collapse-btn');
            if (!btn) return;
            btn.classList.toggle('sb-visible', sidebarFeature());
            // Always show hamburger (three lines) icon
            btn.innerHTML = `<svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="1" y1="2" x2="13" y2="2"/><line x1="1" y1="6" x2="13" y2="6"/><line x1="1" y1="10" x2="13" y2="10"/></svg>`;
        }

        function injectCollapseBtn() {
            if (document.getElementById('korone-sidebar-collapse-btn')) return;
            const btn = document.createElement('button');
            btn.id = 'korone-sidebar-collapse-btn';
            btn.title = 'Toggle Sidebar';
            btn.addEventListener('click', () => {
                setSidebarCollapsed(!sidebarCollapsed());
                applySidebarCollapse();
                updateCollapseBtn();
            });
            document.body.appendChild(btn);
            updateCollapseBtn();
        }

        function buildPanel() {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'position:relative;display:flex;align-items:center;';

            const btn = document.createElement('button');
            btn.id = 'korone-ext-btn'; btn.title = 'Korone Extensions';
            btn.innerHTML = ICON_SVG;

            const overlay = document.createElement('div');
            overlay.id = 'korone-ext-overlay';

            const panel = document.createElement('div');
            panel.id = 'korone-ext-panel';

            // Header
            const hdr = document.createElement('div');
            hdr.id = 'korone-ext-panel-header';
            hdr.innerHTML = `<span id="korone-ext-panel-title">Korone All-in-One</span><div id="korone-ext-panel-user"><img id="korone-ext-panel-avatar" src="" alt=""/><span id="korone-ext-panel-username">Hi, ...</span></div>`;
            panel.appendChild(hdr);

            // Fetch username + headshot
            GM_xmlhttpRequest({method:'GET',url:'https://www.pekora.zip/apisite/users/v1/users/authenticated',withCredentials:true,headers:{Accept:'application/json'},onload:function(r){try{const d=JSON.parse(r.responseText);const uid=d.id,uname=d.displayName||d.name||'';document.getElementById('korone-ext-panel-username').textContent='Hi, '+uname;if(uid){GM_xmlhttpRequest({method:'GET',url:'https://www.pekora.zip/apisite/thumbnails/v1/users/avatar-headshot?userIds='+uid+'&size=48x48&format=Png',withCredentials:true,headers:{Accept:'application/json'},onload:function(r2){try{const d2=JSON.parse(r2.responseText);const imgUrl=(d2.data&&d2.data[0]&&d2.data[0].imageUrl)||'';if(imgUrl){const av=document.getElementById('korone-ext-panel-avatar');if(av)av.src=imgUrl;}}catch{}},onerror:function(){}});}}catch{}}});

            // Rows — sectioned
            const rows = document.createElement('div');
            rows.id = 'korone-ext-rows';

            // Collapsed state per section (persisted)
            function isSectionCollapsed(id) { try { return JSON.parse(localStorage.getItem('korone_sec_'+id)||'false'); } catch { return false; } }
            function setSectionCollapsed(id,v) { localStorage.setItem('korone_sec_'+id, String(v)); }

            SECTIONS.forEach(sec => {
                // Section header
                const secHdr = document.createElement('div');
                secHdr.className = 'korone-section-header';
                const secLbl = document.createElement('span');
                secLbl.className = 'korone-section-label';
                secLbl.style.color = sec.color;
                secLbl.textContent = sec.label;
                const secChev = document.createElement('span');
                secChev.className = 'korone-section-chevron';
                secHdr.appendChild(secLbl); secHdr.appendChild(secChev);

                const body = document.createElement('div');
                body.className = 'korone-section-body';

                function updateCollapse() {
                    const c = isSectionCollapsed(sec.id);
                    body.style.maxHeight = c ? '0px' : (body.scrollHeight || 500) + 'px';
                    secChev.innerHTML = c ? CHEVRON_R : CHEVRON_D;
                }
                secHdr.addEventListener('click', () => {
                    setSectionCollapsed(sec.id, !isSectionCollapsed(sec.id));
                    updateCollapse();
                });

                sec.exts.forEach(n => {
                    const row = document.createElement('div');
                    row.className = 'korone-ext-row';

                    const num = document.createElement('span');
                    num.className = 'korone-ext-num';
                    num.textContent = n === 20 ? '—' : n;

                    const lbl = document.createElement('span');
                    const isOn = n === 20 ? sidebarFeature() : extEnabled(n);
                    lbl.className = 'korone-ext-label ' + (isOn ? '' : 'off');
                    lbl.textContent = EXT_LABELS[n] || ('Ext #'+n);
                    lbl.title = lbl.textContent;

                    const tog = document.createElement('button');
                    tog.className = 'korone-ext-toggle ' + (isOn ? 'on' : 'off');
                    if (n === 20) tog.id = 'korone-ext-toggle-sidebar';
                    tog.title = n === 20 ? 'Collapse/expand sidebar' : 'Toggle (takes effect on next page load)';

                    tog.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (n === 20) {
                            // Toggle the feature (show/hide the collapse button)
                            const newVal = !sidebarFeature();
                            setSidebarFeature(newVal);
                            tog.classList.toggle('on', newVal);
                            tog.classList.toggle('off', !newVal);
                            lbl.classList.toggle('off', !newVal);
                            // If turning off, also expand sidebar back
                            if (!newVal && sidebarCollapsed()) {
                                setSidebarCollapsed(false);
                                applySidebarCollapse();
                            }
                            updateCollapseBtn();
                        } else {
                            const cur = tog.classList.contains('on');
                            extSet(n, !cur);
                            tog.classList.toggle('on', !cur); tog.classList.toggle('off', cur);
                            lbl.classList.toggle('off', cur);
                        }
                    });

                    row.appendChild(num); row.appendChild(lbl); row.appendChild(tog);
                    body.appendChild(row);
                });

                rows.appendChild(secHdr);
                rows.appendChild(body);
                // Init collapse state after appended (need scrollHeight)
                setTimeout(updateCollapse, 0);
            });

            panel.appendChild(rows);

            // Footer
            const footer = document.createElement('div');
            footer.id = 'korone-ext-footer';
            footer.innerHTML = `<div id="korone-ext-footer-dot"></div><span id="korone-ext-footer-text">Changes apply on reload</span><button id="korone-ext-reload">Reload</button>`;
            panel.appendChild(footer);
            footer.querySelector('#korone-ext-reload').addEventListener('click', () => location.reload());

            function openPanel() {
                panel.classList.add('open');
                overlay.classList.add('open');
                btn.classList.add('korone-active');
                const rect = btn.getBoundingClientRect();
                const pw = 260;
                let left = rect.right - pw;
                if (left < 8) left = 8;
                panel.style.top  = (rect.bottom + 6) + 'px';
                panel.style.left = left + 'px';
                // Re-apply section heights now DOM is visible
                panel.querySelectorAll('.korone-section-body').forEach(b => {
                    const id = b.previousSibling && b.previousSibling.querySelector && b.previousSibling.querySelector('.korone-section-label') && b.previousSibling.querySelector('.korone-section-label').closest('.korone-section-header');
                    if (!isSectionCollapsed_by_body(b)) b.style.maxHeight = b.scrollHeight + 'px';
                });
            }
            function isSectionCollapsed_by_body(body) { return body.style.maxHeight === '0px'; }
            function closePanel() {
                panel.classList.remove('open');
                overlay.classList.remove('open');
                btn.classList.remove('korone-active');
            }
            btn.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.contains('open') ? closePanel() : openPanel(); });
            overlay.addEventListener('click', closePanel);

            wrap.appendChild(btn);
            return { wrap, panel, overlay };
        }

        function tryInject() {
            if (document.getElementById('korone-ext-btn')) return true;
            const candidates = [
                () => document.querySelector('li:has(.settingsIcon), li:has([class*="settingsIcon"])'),
                () => document.querySelector('[class*="icon-nav-settings"]')?.closest('li'),
                () => document.querySelector('nav ul li:last-child'),
                () => document.querySelector('[class*="navbar"] ul li:last-child'),
                () => document.querySelector('[class*="navBar"] ul li:last-child'),
                () => document.querySelector('header ul li:last-child'),
            ];
            let anchor = null;
            for (const fn of candidates) { try { anchor = fn(); if (anchor) break; } catch {} }
            if (!anchor) return false;
            const { wrap, panel, overlay } = buildPanel();
            document.body.appendChild(overlay);
            document.body.appendChild(panel);
            const newLi = document.createElement('li');
            newLi.appendChild(wrap);
            anchor.parentElement.insertBefore(newLi, anchor);
            return true;
        }

        // Apply sidebar state on load + inject collapse button
        function initSidebar() {
            injectCollapseBtn();
            if (sidebarFeature() && sidebarCollapsed()) applySidebarCollapse();
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSidebar);
        } else {
            initSidebar();
        }
        // Re-apply on SPA nav — debounced
        let _sbTimer = null;
        new MutationObserver(() => {
            injectCollapseBtn();
            if (sidebarFeature() && sidebarCollapsed()) {
                clearTimeout(_sbTimer);
                _sbTimer = setTimeout(applySidebarCollapse, 120);
            }
        }).observe(document.body, { childList: true, subtree: true });

        if (!tryInject()) {
            const mo = new MutationObserver(() => { if (tryInject()) mo.disconnect(); });
            mo.observe(document.body, { childList: true, subtree: true });
        }
    })();


    // ============================================================
    // #1 — Faster User Search (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(1)) return;
        const BASE = 'https://www.pekora.zip';
        const FALLBACK_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
        let csrfToken = '';
        let currentQuery = '';
        let lastFetchedQuery = '';
        let lastFetchedResults = { users: [], headshots: {}, details: {}, staff: {} };
        let debounceTimer = null;
        let selectedIndex = -1;
        let allItems = [];

        const style = document.createElement('style');
        style.textContent = `
            .btr-fastsearch-link {
                display: flex !important; align-items: center !important;
                padding: 6px 12px !important; text-decoration: none !important;
                cursor: pointer !important; color: inherit !important;
            }
            .btr-fastsearch-link:hover, .btr-fastsearch-link.btr-selected { background: rgba(255,255,255,0.08) !important; }
            .btr-fastsearch-link.btr-banned { opacity: 0.45; }
            .btr-fastsearch-avatar { width: 30px; height: 30px; min-width: 30px; margin-right: 10px; }
            .btr-fastsearch-thumbnail-container { display: block; overflow: hidden; width: 100%; height: 100%; border-radius: 20px; border: 1px solid #a0a0a0; background-color: rgba(0,0,0,.1); }
            .btr-fastsearch-thumbnail { width: 100%; height: 100%; opacity: 1; transition: opacity .5s ease; }
            .btr-fastsearch-thumbnail.loading { opacity: 0; }
            .btr-fastsearch-info { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
            .btr-fastsearch-name b { color: #60a5fa; }
            .btr-fastsearch-name-row { display: flex; align-items: center; overflow: visible; }
            .btr-fastsearch-name { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .btr-fastsearch-verified { flex-shrink: 0; display: inline-block !important; width: 16px !important; height: 16px !important; background-size: contain !important; transform: none !important; margin-left: 3px; }
            .btr-fastsearch-admin { flex-shrink: 0; width: 16px !important; height: 16px !important; background-size: 32px auto !important; background-position: -16px -96px !important; display: inline-block !important; vertical-align: middle; margin-left: 3px; }
            .btr-fastsearch-banned-tag { font-size: 10px; color: #f87171; background: rgba(248,113,113,0.15); border-radius: 3px; padding: 1px 4px; white-space: nowrap; flex-shrink: 0; margin-left: 3px; }
            .btr-fastsearch-displayname { font-size: 11px; opacity: 0.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .btr-fastsearch-separator { height: 1px; background: rgba(255,255,255,0.08); margin: 4px 10px; }
            .btr-fastsearch-notfound { display: flex; align-items: center; padding: 8px 12px; font-size: 13px; opacity: 0.45; font-style: italic; }
            .btr-fastsearch-label { padding: 6px 12px 2px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.35; user-select: none; }
            .btr-fastsearch-loading { display: flex; align-items: center; padding: 8px 12px; opacity: 0.5; font-size: 13px; }
            .btr-fastsearch-loading .btr-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.15); border-top-color: rgba(255,255,255,0.6); border-radius: 50%; animation: btr-spin 0.6s linear infinite; margin-right: 8px; }
            @keyframes btr-spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);

        function getCsrfFromCookie() { const match = document.cookie.match(/rbxcsrf4=([^;]+)/); return match ? match[1] : ''; }

        async function fetchWithCsrf(url, options = {}) {
            if (!csrfToken) csrfToken = getCsrfFromCookie();
            options.headers = options.headers || {};
            options.headers['Content-Type'] = 'application/json';
            if (csrfToken) options.headers['x-csrf-token'] = csrfToken;
            options.credentials = 'include';
            let resp = await fetch(url, options);
            if (resp.status === 403) { const t = resp.headers.get('x-csrf-token'); if (t) { csrfToken = t; options.headers['x-csrf-token'] = t; resp = await fetch(url, options); } }
            return resp;
        }

        async function searchUsers(keyword) {
            try {
                const resp = await fetchWithCsrf(`${BASE}/apisite/users/v1/usernames/users`, { method: 'POST', body: JSON.stringify({ usernames: [keyword], excludeBannedUsers: false }) });
                if (!resp.ok) return []; return (await resp.json()).data || [];
            } catch { return []; }
        }
        async function getUserDetails(userId) { try { const r = await fetch(`${BASE}/apisite/users/v1/users/${userId}`, { credentials: 'include' }); if (!r.ok) return null; return await r.json(); } catch { return null; } }
        async function getAllUserDetails(ids) { const d = {}; await Promise.all(ids.map(async id => { const r = await getUserDetails(id); if (r) d[id] = r; })); return d; }
        async function checkStaff(userId) { try { const r = await fetch(`${BASE}/Game/LuaWebService/HandleSocialRequest.ashx?method=isingroup&playerid=${userId}&groupid=1200769`, { credentials: 'include' }); if (!r.ok) return false; return (await r.text()).includes('>true<'); } catch { return false; } }
        async function getAllStaffStatus(ids) { const s = {}; await Promise.all(ids.map(async id => { s[id] = await checkStaff(id); })); return s; }
        async function getHeadshots(ids) {
            if (!ids.length) return {};
            try { const r = await fetch(`${BASE}/apisite/thumbnails/v1/users/avatar-headshot?userIds=${ids.join(',')}&size=150x150&format=Png&isCircular=false`, { credentials: 'include' }); if (!r.ok) return {}; const j = await r.json(); const m = {}; for (const i of (j.data || [])) { if (i.imageUrl) m[i.targetId] = i.imageUrl; } return m; } catch { return {}; }
        }

        function getClassNames(dd) { const e = dd.querySelector('a:not(.btr-fastsearch-link)'); return { linkClass: e ? e.className.trim() : '' }; }

        function createUserElement(user, headshot, detail, isStaff, query, classes) {
            const isBanned = detail ? detail.isBanned : false, hasVerified = detail ? detail.hasVerifiedBadge : false, displayName = detail ? detail.displayName : (user.displayName || user.name);
            const a = document.createElement('a'); a.className = (classes.linkClass ? classes.linkClass + ' ' : '') + 'btr-fastsearch-link'; if (isBanned) a.classList.add('btr-banned'); a.href = `/users/${user.id}/profile`;
            const avatarDiv = document.createElement('div'); avatarDiv.className = 'btr-fastsearch-avatar';
            const container = document.createElement('div'); container.className = 'btr-fastsearch-thumbnail-container';
            const img = document.createElement('img'); img.className = 'btr-fastsearch-thumbnail loading'; img.src = FALLBACK_IMG; img.alt = user.name;
            if (headshot) { const real = new Image(); real.onload = () => { img.src = headshot; img.classList.remove('loading'); }; real.onerror = () => img.classList.remove('loading'); real.src = headshot; } else { img.classList.remove('loading'); }
            container.appendChild(img); avatarDiv.appendChild(container); a.appendChild(avatarDiv);
            const infoDiv = document.createElement('div'); infoDiv.className = 'btr-fastsearch-info';
            const nameRow = document.createElement('div'); nameRow.className = 'btr-fastsearch-name-row';
            const nameDiv = document.createElement('div'); nameDiv.className = 'btr-fastsearch-name'; nameDiv.appendChild(highlightMatch(user.name, query)); nameRow.appendChild(nameDiv);
            if (hasVerified) { const b = document.createElement('span'); b.className = 'icon-verified altIcon-0-2-86 btr-fastsearch-verified'; nameRow.appendChild(b); }
            if (isStaff) { const b = document.createElement('span'); b.className = 'icon-administrator btr-fastsearch-admin'; nameRow.appendChild(b); }
            if (isBanned) { const t = document.createElement('span'); t.className = 'btr-fastsearch-banned-tag'; t.textContent = 'Banned'; nameRow.appendChild(t); }
            infoDiv.appendChild(nameRow);
            if (displayName && displayName !== user.name) { const d = document.createElement('div'); d.className = 'btr-fastsearch-displayname'; d.textContent = `@${displayName}`; infoDiv.appendChild(d); }
            a.appendChild(infoDiv); return a;
        }

        function highlightMatch(name, query) {
            const frag = document.createDocumentFragment(); const idx = name.toLowerCase().indexOf(query.toLowerCase());
            if (idx === -1) { frag.appendChild(document.createTextNode(name)); return frag; }
            if (idx > 0) frag.appendChild(document.createTextNode(name.slice(0, idx)));
            const b = document.createElement('b'); b.textContent = name.slice(idx, idx + query.length); frag.appendChild(b);
            if (idx + query.length < name.length) frag.appendChild(document.createTextNode(name.slice(idx + query.length)));
            return frag;
        }

        function createSeparator() { const d = document.createElement('div'); d.className = 'btr-fastsearch-separator'; return d; }
        function createLabel(text) { const d = document.createElement('div'); d.className = 'btr-fastsearch-label'; d.textContent = text; return d; }
        function createNotFound(query) { const d = document.createElement('div'); d.className = 'btr-fastsearch-notfound'; d.textContent = `No user found for "${query}"`; return d; }
        function createLoading() { const d = document.createElement('div'); d.className = 'btr-fastsearch-loading'; d.innerHTML = '<div class="btr-spinner"></div> Searching...'; return d; }
        function clearInjected(dd) { dd.querySelectorAll('.btr-fastsearch-link, .btr-fastsearch-separator, .btr-fastsearch-loading, .btr-fastsearch-notfound, .btr-fastsearch-label').forEach(el => el.remove()); }
        function rebuildAllItems(dd) { allItems = []; selectedIndex = -1; dd.querySelectorAll('a').forEach(a => allItems.push(a)); }
        function updateSelection() { allItems.forEach((el, i) => el.classList.toggle('btr-selected', i === selectedIndex)); if (selectedIndex >= 0 && allItems[selectedIndex]) allItems[selectedIndex].scrollIntoView({ block: 'nearest' }); }

        function renderResults(users, headshots, details, staff, query, dd) {
            const classes = getClassNames(dd); clearInjected(dd);
            const first = dd.querySelector('a:not(.btr-fastsearch-link)');
            dd.insertBefore(createLabel('Users'), first);
            if (!users.length) { dd.insertBefore(createNotFound(query), first); }
            else { for (const u of users) dd.insertBefore(createUserElement(u, headshots[u.id], details[u.id], staff[u.id], query, classes), first); }
            if (first) { dd.insertBefore(createSeparator(), first); dd.insertBefore(createLabel('Search'), first); }
            rebuildAllItems(dd);
        }

        async function performFastSearch(query, dd) {
            query = query.trim();
            if (query === lastFetchedQuery) { renderResults(lastFetchedResults.users, lastFetchedResults.headshots, lastFetchedResults.details, lastFetchedResults.staff, query, dd); return; }
            currentQuery = query;
            if (!query) { clearInjected(dd); rebuildAllItems(dd); lastFetchedQuery = ''; lastFetchedResults = { users: [], headshots: {}, details: {}, staff: {} }; return; }
            clearInjected(dd);
            const loading = createLoading(); const first = dd.querySelector('a:not(.btr-fastsearch-link)'); dd.insertBefore(loading, first || dd.firstChild); rebuildAllItems(dd);
            const users = await searchUsers(query); if (currentQuery !== query) return;
            const finalUsers = users.slice(0, 4); let headshots = {}, details = {}, staff = {};
            if (finalUsers.length) { const ids = finalUsers.map(u => u.id); [headshots, details, staff] = await Promise.all([getHeadshots(ids), getAllUserDetails(ids), getAllStaffStatus(ids)]); if (currentQuery !== query) return; }
            lastFetchedQuery = query; lastFetchedResults = { users: finalUsers, headshots, details, staff };
            renderResults(finalUsers, headshots, details, staff, query, dd);
        }

        function hookSearchInput(input) {
            if (input.dataset.btrHooked) return; input.dataset.btrHooked = 'true';
            let lastInputValue = '';
            const wrapper = input.closest('[class*="seniorClass"]') || input.closest('div[style*="width"]') || input.parentElement?.parentElement;
            if (!wrapper) return;
            function getDropdown() { return wrapper.querySelector('[class*="container-0-2-"]'); }
            const obs = new MutationObserver(() => {
                const dd = getDropdown();
                if (dd && !dd.querySelector('.btr-fastsearch-link, .btr-fastsearch-loading, .btr-fastsearch-notfound')) {
                    const q = input.value.trim();
                    if (q && q === lastFetchedQuery) renderResults(lastFetchedResults.users, lastFetchedResults.headshots, lastFetchedResults.details, lastFetchedResults.staff, q, dd);
                }
            });
            obs.observe(wrapper, { childList: true, subtree: true });
            input.addEventListener('input', () => { const val = input.value.trim(); if (val === lastInputValue) return; lastInputValue = val; clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { const dd = getDropdown(); if (dd) performFastSearch(val, dd); }, 300); });
            input.addEventListener('keydown', (e) => {
                if (!allItems.length) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); e.stopImmediatePropagation(); selectedIndex = Math.min(selectedIndex + 1, allItems.length - 1); updateSelection(); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); e.stopImmediatePropagation(); selectedIndex = Math.max(selectedIndex - 1, -1); updateSelection(); }
                else if (e.key === 'Enter' && selectedIndex >= 0) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); const href = allItems[selectedIndex]?.href; if (href) window.location.href = href; }
            }, true);
        }

        function initFastSearch() {
            document.querySelectorAll('input[class*="searchInput"]').forEach(hookSearchInput);
            new MutationObserver((mutations) => { for (const m of mutations) for (const node of m.addedNodes) { if (node.nodeType !== 1) continue; if (node.matches?.('input[class*="searchInput"]')) hookSearchInput(node); node.querySelectorAll?.('input[class*="searchInput"]').forEach(hookSearchInput); } }).observe(document.body, { childList: true, subtree: true });
        }

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFastSearch); else initFastSearch();
    })();


    // ============================================================
    // #2 — Better My Friends (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(2)) return;
        const BASE = 'https://www.pekora.zip';
        let csrfToken = '';
        const detailsCache = {}, staffCache = {}, headshotCache = {};
        let PAGE_USER_ID = null;
        let allFriendsData = [], allFollowersData = [], allFollowingsData = [], allRequestsData = [];
        let currentPage = 1, PER_PAGE = 18, currentSearch = '', currentSort = 'default';
        const selectedIds = new Set();
        let isEnriching = false;
        const enrichedPages = new Set();
        let initialized = false, lastUrl = '';

        function detectTheme() {
            for (const sel of ['[class*="friendsContainer"]', '.container.ssp', '[class*="friendCard"]', 'body']) {
                const el = document.querySelector(sel); if (!el) continue;
                const bg = getComputedStyle(el).backgroundColor;
                const m = bg?.match(/\d+/g);
                if (!m || m.length < 3) continue;
                if (m.length >= 4 && parseFloat(m[3]) === 0) continue;
                return (0.299 * parseInt(m[0]) + 0.587 * parseInt(m[1]) + 0.114 * parseInt(m[2])) / 255 > 0.5 ? 'light' : 'dark';
            }
            return 'dark';
        }

        function C() {
            const dk = detectTheme() === 'dark';
            return dk ? {
                text:'#e8e8e8', textDim:'#aaa', textMuted:'#777', cardBg:'#1e1e2e', cardBorder:'#333',
                inputBg:'#191928', inputBorder:'#3a3a4a', inputFocus:'#555', placeholder:'#666',
                btnBg:'#2a2a3d', btnBorder:'#3a3a4d', btnText:'#ccc', btnRedBg:'#c0392b', btnOrangeBg:'#d68910', btnGreenBg:'#27ae60',
                selBg:'#2e1a1a', selBorder:'#e74c3c', banBg:'#1a0e0e', banBorder:'#4a1a1a', banName:'#777', banBadge:'#c0392b',
                pageBg:'#1e1e2e', pageActive:'#3a3a4d', pageBorder:'#333', stRed:'#ff6b6b', stBlue:'#74b9ff',
                progBg:'#333', progBar:'#e74c3c', ufColor:'#ff6b6b', ufBorder:'rgba(192,57,43,0.4)',
                accColor:'#6bffb8', accBorder:'rgba(39,174,96,0.4)', selectBg:'#191928', divider:'#2a2a3a', shadow:'rgba(0,0,0,0.3)',
            } : {
                text:'#1a1a1a', textDim:'#555', textMuted:'#888', cardBg:'#fff', cardBorder:'#e0e0e0',
                inputBg:'#fff', inputBorder:'#d0d0d0', inputFocus:'#999', placeholder:'#aaa',
                btnBg:'#f0f0f0', btnBorder:'#d0d0d0', btnText:'#333', btnRedBg:'#dc3545', btnOrangeBg:'#e67e22', btnGreenBg:'#28a745',
                selBg:'#fef0ef', selBorder:'#dc3545', banBg:'#fdf5f4', banBorder:'#e8c4c0', banName:'#bbb', banBadge:'#dc3545',
                pageBg:'#f5f5f5', pageActive:'#ddd', pageBorder:'#ddd', stRed:'#dc3545', stBlue:'#1a73e8',
                progBg:'#e0e0e0', progBar:'#dc3545', ufColor:'#dc3545', ufBorder:'rgba(220,53,69,0.3)',
                accColor:'#28a745', accBorder:'rgba(40,167,69,0.3)', selectBg:'#fff', divider:'#eee', shadow:'rgba(0,0,0,0.06)',
            };
        }

        function injectStyles() {
            const c = C(); document.getElementById('pk-styles')?.remove();
            const s = document.createElement('style'); s.id = 'pk-styles';
            s.textContent = `
                .pk-hidden{display:none!important}
                #pk-root{margin-top:12px;font-family:inherit}
                #pk-root .pk-card:hover{background:${c.cardBg}!important}
                #pk-root .pk-card.pk-sel:hover{background:${c.selBg}!important}
                #pk-root .pk-card.pk-ban:hover{background:${c.banBg}!important}
                #pk-root .pk-btn:hover{background:${c.btnBg}!important}
                #pk-root .pk-btn-red:hover{background:${c.btnRedBg}!important}
                #pk-root .pk-btn-orange:hover{background:${c.btnOrangeBg}!important}
                #pk-root .pk-btn-green:hover{background:${c.btnGreenBg}!important}
                #pk-root .pk-search:hover{background:${c.inputBg}!important}
                #pk-root .pk-select:hover,#pk-root .pk-select-dd:hover{background:${c.selectBg}!important}
                #pk-root .pk-pg:hover{background:${c.pageBg}!important}
                #pk-root .pk-pg-on:hover{background:${c.pageActive}!important}
                #pk-root .pk-uf-btn:hover,#pk-root .pk-acc-btn:hover,#pk-root .pk-dec-btn:hover{background:transparent!important}
                #pk-root .pk-badge-ban:hover{background:${c.banBadge}!important}
                #pk-root .pk-badge-v:hover,#pk-root .pk-badge-a:hover{background-color:transparent!important}
                #pk-root .pk-name:hover,#pk-root .pk-avatar:hover,#pk-root .pk-cb:hover,#pk-root a:hover,#pk-root .pk-display:hover,#pk-root .pk-info:hover,#pk-root .pk-name-row:hover,#pk-root .pk-card-actions:hover{background:transparent!important}
                .pk-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid ${c.divider}}
                .pk-header-left{display:flex;align-items:baseline;gap:10px}
                .pk-title{font-size:24px!important;font-weight:300!important;margin:0!important;color:${c.text}!important}
                .pk-count{font-size:18px!important;font-weight:300!important;color:${c.textMuted}!important}
                .pk-stats{font-size:13px!important;color:${c.textDim}!important;display:flex;gap:14px;align-items:center}
                .pk-stats .st-red{color:${c.stRed}!important;font-weight:600!important}
                .pk-stats .st-blue{color:${c.stBlue}!important;font-weight:600!important}
                .pk-toolbar{display:flex;flex-direction:column;gap:12px;margin-bottom:16px}
                .pk-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
                .pk-search{padding:9px 14px!important;border:1px solid ${c.inputBorder}!important;border-radius:6px!important;background:${c.inputBg}!important;color:${c.text}!important;font-size:15px!important;font-family:inherit!important;outline:none!important;width:280px!important}
                .pk-search:focus{border-color:${c.inputFocus}!important}
                .pk-search::placeholder{color:${c.placeholder}!important}
                .pk-select,.pk-select-dd{padding:9px 12px!important;border:1px solid ${c.inputBorder}!important;border-radius:6px!important;background:${c.selectBg}!important;color:${c.text}!important;font-size:14px!important;font-family:inherit!important;cursor:pointer!important;outline:none!important}
                .pk-select option,.pk-select-dd option{background:${c.selectBg}!important;color:${c.text}!important}
                .pk-btn{padding:8px 18px!important;border:1px solid ${c.btnBorder}!important;border-radius:6px!important;background:${c.btnBg}!important;color:${c.btnText}!important;font-size:14px!important;font-weight:500!important;cursor:pointer!important;font-family:inherit!important;white-space:nowrap!important}
                .pk-btn:disabled{opacity:0.35!important;cursor:default!important}
                .pk-btn-red{background:${c.btnRedBg}!important;border-color:${c.btnRedBg}!important;color:#fff!important}
                .pk-btn-orange{background:${c.btnOrangeBg}!important;border-color:${c.btnOrangeBg}!important;color:#fff!important}
                .pk-btn-green{background:${c.btnGreenBg}!important;border-color:${c.btnGreenBg}!important;color:#fff!important}
                .pk-sep{width:1px;height:24px;background:${c.divider};flex-shrink:0;margin:0 4px}
                .pk-progress{font-size:14px!important;color:${c.textDim}!important;margin-bottom:10px;min-height:20px}
                .pk-bar-wrap{display:inline-block;width:160px;height:6px;background:${c.progBg}!important;border-radius:3px;overflow:hidden;vertical-align:middle;margin-left:10px}
                .pk-bar{height:100%;background:${c.progBar}!important;border-radius:3px;transition:width 0.15s}
                .pk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
                @media(max-width:991px){.pk-grid{grid-template-columns:repeat(2,1fr)}}
                @media(max-width:575px){.pk-grid{grid-template-columns:1fr}}
                .pk-card{display:flex;align-items:center;gap:14px;padding:14px 40px 14px 14px;border:1px solid ${c.cardBorder}!important;border-radius:8px;position:relative;background:${c.cardBg}!important;box-shadow:0 1px 3px ${c.shadow}}
                .pk-card.pk-sel{border-color:${c.selBorder}!important;background:${c.selBg}!important}
                .pk-card.pk-ban{opacity:0.4;border-color:${c.banBorder}!important;background:${c.banBg}!important}
                .pk-card.pk-ban .pk-avatar{filter:grayscale(0.8)}
                .pk-card.pk-ban .pk-name{text-decoration:line-through!important;color:${c.banName}!important}
                .pk-avatar{width:60px;height:60px;border-radius:50%;flex-shrink:0;object-fit:cover;border:none!important}
                .pk-info{flex:1;min-width:0;overflow:hidden}
                .pk-name-row{display:flex;align-items:center;gap:5px;overflow:hidden}
                .pk-name{font-size:18px!important;font-weight:500!important;color:${c.text}!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;flex-shrink:1;min-width:0;text-decoration:none!important}
                .pk-display{font-size:13px!important;color:${c.textMuted}!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}
                .pk-badge-v{width:16px!important;height:16px!important;flex-shrink:0;display:inline-block!important;background-size:contain!important;transform:none!important}
                .pk-badge-a{width:16px!important;height:16px!important;flex-shrink:0;display:inline-block!important;background-size:32px auto!important;background-position:-16px -96px!important}
                .pk-badge-ban{font-size:10px!important;font-weight:700!important;background:${c.banBadge}!important;color:#fff!important;padding:2px 6px!important;border-radius:3px!important;line-height:15px!important;flex-shrink:0;white-space:nowrap;letter-spacing:0.3px}
                .pk-card-actions{margin-top:4px;display:flex;gap:6px}
                .pk-uf-btn,.pk-acc-btn,.pk-dec-btn{font-size:12px!important;padding:4px 12px!important;border-radius:4px!important;background:transparent!important;cursor:pointer!important;font-family:inherit!important;font-weight:500!important}
                .pk-uf-btn{border:1px solid ${c.ufBorder}!important;color:${c.ufColor}!important}
                .pk-acc-btn{border:1px solid ${c.accBorder}!important;color:${c.accColor}!important}
                .pk-dec-btn{border:1px solid ${c.ufBorder}!important;color:${c.ufColor}!important}
                .pk-uf-btn:disabled,.pk-acc-btn:disabled,.pk-dec-btn:disabled{opacity:0.3!important;cursor:default!important}
                .pk-cb{position:absolute!important;top:50%!important;right:12px!important;transform:translateY(-50%)!important;width:18px!important;height:18px!important;cursor:pointer!important;accent-color:${c.selBorder}!important}
                .pk-pages{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:20px}
                .pk-pg{min-width:36px;height:36px;border:1px solid ${c.pageBorder}!important;border-radius:6px!important;background:${c.pageBg}!important;color:${c.text}!important;font-size:14px!important;cursor:pointer!important;font-family:inherit!important;display:flex;align-items:center;justify-content:center;padding:0 10px;font-weight:500}
                .pk-pg:disabled{opacity:0.25!important;cursor:default!important}
                .pk-pg-on{background:${c.pageActive}!important;font-weight:600!important}
                .pk-pg-dots{color:${c.textMuted}!important;font-size:14px!important}
                .pk-loading{text-align:center;padding:50px;color:${c.textMuted}!important;font-size:15px!important}
                .pk-empty{text-align:center;padding:50px;color:${c.textMuted}!important;font-size:15px!important}
            `;
            document.head.appendChild(s);
        }

        function pkGetCsrf() { const m = document.cookie.match(/rbxcsrf4=([^;]+)/); return m ? m[1] : ''; }
        async function postApi(url, body = {}) {
            if (!csrfToken) csrfToken = pkGetCsrf();
            const h = { 'Content-Type': 'application/json' }; if (csrfToken) h['x-csrf-token'] = csrfToken;
            let r = await fetch(url, { method: 'POST', headers: h, credentials: 'include', body: JSON.stringify(body) });
            if (r.status === 403) { const t = r.headers.get('x-csrf-token'); if (t) { csrfToken = t; h['x-csrf-token'] = t; r = await fetch(url, { method: 'POST', headers: h, credentials: 'include', body: JSON.stringify(body) }); } }
            return r;
        }
        async function getApi(url) { const r = await fetch(url, { credentials: 'include' }); if (!r.ok) throw new Error(r.status); return r.json(); }
        function pkSleep(ms) { return new Promise(r => setTimeout(r, ms)); }
        function pkEsc(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

        async function fetchFriends(uid) { let a = [], c = ''; do { try { const d = await getApi(`${BASE}/apisite/friends/v1/users/${uid}/friends?cursor=${c}&limit=100`); if (d.data) a = a.concat(d.data); c = d.nextPageCursor || ''; } catch { break; } } while (c); return a; }
        async function fetchPaged(ep, uid) { let a = [], c = ''; do { try { const d = await getApi(`${BASE}/apisite/friends/v1/users/${uid}/${ep}?cursor=${c}&sort=Asc&limit=100`); if (d.data) a = a.concat(d.data); c = d.nextPageCursor || ''; } catch { break; } } while (c); return a; }
        async function fetchReqs() { let a = [], c = ''; do { try { const d = await getApi(`${BASE}/apisite/friends/v1/my/friends/requests?limit=100&cursor=${c}`); if (d.data) a = a.concat(d.data); c = d.nextPageCursor || ''; } catch { break; } } while (c); return a; }
        async function pkGetDetails(id) { if (detailsCache[id]) return detailsCache[id]; try { const d = await getApi(`${BASE}/apisite/users/v1/users/${id}`); detailsCache[id] = d; return d; } catch { return null; } }
        async function pkGetStaff(id) { if (staffCache[id] !== undefined) return staffCache[id]; try { const r = await fetch(`${BASE}/Game/LuaWebService/HandleSocialRequest.ashx?method=isingroup&playerid=${id}&groupid=1200769`, { credentials: 'include' }); if (!r.ok) { staffCache[id] = false; return false; } staffCache[id] = (await r.text()).includes('>true<'); return staffCache[id]; } catch { staffCache[id] = false; return false; } }
        async function pkGetHeadshots(ids) { const need = ids.filter(id => !headshotCache[id]); for (let i = 0; i < need.length; i += 100) { const chunk = need.slice(i, i + 100); try { const d = await getApi(`${BASE}/apisite/thumbnails/v1/users/avatar-headshot?userIds=${chunk.join(',')}&size=150x150&format=Png&isCircular=false`); for (const it of (d.data || [])) { if (it.imageUrl) headshotCache[it.targetId] = it.imageUrl; } } catch {} } }

        function isBanned(u) { return detailsCache[u.id]?.isBanned === true; }
        function isVerified(u) { return detailsCache[u.id]?.hasVerifiedBadge === true; }
        function isAdmin(u) { return staffCache[u.id] === true; }
        function isMine() { const h = document.querySelector('h3[class*="title"]'); if (h && h.textContent.includes('My Friends')) return true; for (const t of document.querySelectorAll('[class*="entry-"]')) { if (t.textContent.trim() === 'Friend Requests') return true; } return false; }
        function activeTab() { const a = document.querySelector('[class*="entryActive"]'); return a ? a.textContent.trim() : 'Friends'; }
        function getData() { const t = activeTab(); return t === 'Friends' ? allFriendsData : t === 'Followers' ? allFollowersData : t === 'Followings' ? allFollowingsData : t === 'Friend Requests' ? allRequestsData : []; }
        function isCorrectPage() { return /\/users\/\d+\/friends/.test(window.location.pathname); }

        function filtered() {
            let d = [...getData()]; const q = currentSearch.toLowerCase();
            if (q) d = d.filter(u => (u.name || '').toLowerCase().includes(q) || (u.displayName || '').toLowerCase().includes(q) || String(u.id).includes(q));
            switch (currentSort) {
                case 'name-asc': d.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
                case 'name-desc': d.sort((a, b) => (b.name || '').localeCompare(a.name || '')); break;
                case 'id-asc': d.sort((a, b) => a.id - b.id); break;
                case 'id-desc': d.sort((a, b) => b.id - a.id); break;
                case 'banned-first': d.sort((a, b) => { const diff = (isBanned(b) ? 1 : 0) - (isBanned(a) ? 1 : 0); return diff !== 0 ? diff : (a.name || '').localeCompare(b.name || ''); }); break;
                case 'verified-first': d.sort((a, b) => { const diff = (isVerified(b) ? 1 : 0) - (isVerified(a) ? 1 : 0); return diff !== 0 ? diff : (a.name || '').localeCompare(b.name || ''); }); break;
                case 'admin-first': d.sort((a, b) => { const diff = (isAdmin(b) ? 1 : 0) - (isAdmin(a) ? 1 : 0); return diff !== 0 ? diff : (a.name || '').localeCompare(b.name || ''); }); break;
            }
            return d;
        }

        function paged() { const a = filtered(), tp = Math.max(1, Math.ceil(a.length / PER_PAGE)); if (currentPage > tp) currentPage = tp; if (currentPage < 1) currentPage = 1; return { users: a.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE), total: a.length, pages: tp }; }
        function pageNums(cur, total) { if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1); const p = [1]; if (cur > 3) p.push('…'); for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) p.push(i); if (cur < total - 2) p.push('…'); p.push(total); return p; }

        function cardHtml(u, showFriend, showReq) {
            const det = detailsCache[u.id], ban = isBanned(u), ver = isVerified(u), adm = isAdmin(u);
            const hs = headshotCache[u.id] || '', dn = det?.displayName || u.displayName, sel = selectedIds.has(u.id);
            const showCb = showFriend || showReq;
            let h = `<div class="pk-card${ban?' pk-ban':''}${sel?' pk-sel':''}" data-uid="${u.id}">`;
            if (showCb) h += `<input type="checkbox" class="pk-cb" data-uid="${u.id}" ${sel?'checked':''}>`;
            h += `<a href="/users/${u.id}/profile"><img class="pk-avatar" src="${hs||'/images/thumbnails/default_headshot.png'}" alt="${pkEsc(u.name)}" onerror="this.src='/images/thumbnails/default_headshot.png'"></a>`;
            h += `<div class="pk-info"><div class="pk-name-row"><a class="pk-name" href="/users/${u.id}/profile" title="${pkEsc(u.name)}">${pkEsc(u.name)}</a>`;
            if (ver) h += `<span class="icon-verified altIcon-0-2-86 pk-badge-v" title="Verified"></span>`;
            if (adm) h += `<span class="icon-administrator pk-badge-a" title="Admin"></span>`;
            if (ban) h += `<span class="pk-badge-ban">BANNED</span>`;
            h += `</div>`;
            if (dn && dn !== u.name) h += `<div class="pk-display">@${pkEsc(dn)}</div>`;
            if (showFriend) h += `<div class="pk-card-actions"><button class="pk-uf-btn" data-uid="${u.id}">Unfriend</button></div>`;
            if (showReq) h += `<div class="pk-card-actions"><button class="pk-acc-btn" data-uid="${u.id}">Accept</button><button class="pk-dec-btn" data-uid="${u.id}">Ignore</button></div>`;
            h += `</div></div>`;
            return h;
        }

        function statsHtml() { const all = getData(), bannedN = all.filter(u => isBanned(u)).length, total = filtered().length; let s = `<span>Total: ${all.length}</span>`; if (currentSearch) s += `<span>Showing: ${total}</span>`; if (bannedN > 0) s += `<span class="st-red">Banned: ${bannedN}</span>`; if (selectedIds.size > 0) s += `<span class="st-blue">Selected: ${selectedIds.size}</span>`; return s; }

        function render() {
            const root = document.getElementById('pk-root'); if (!root) return;
            const oldS = root.querySelector('.pk-search'), wasFocused = oldS && document.activeElement === oldS, curPos = wasFocused ? (oldS.selectionStart || 0) : 0;
            const { users, pages } = paged(), tab = activeTab(), mine = isMine(), all = getData();
            const showFriend = mine && tab === 'Friends', showReq = mine && tab === 'Friend Requests', showActions = showFriend || showReq;
            let html = `<div class="pk-header"><div class="pk-header-left"><h2 class="pk-title">${tab.toUpperCase()}</h2><span class="pk-count">(${all.length})</span></div><div class="pk-stats">${statsHtml()}</div></div>`;
            html += `<div class="pk-toolbar"><div class="pk-row"><input class="pk-search" type="text" placeholder="Search ${all.length} ${tab.toLowerCase()}..." value="${pkEsc(currentSearch)}"><select class="pk-select" id="pk-sort"><option value="default"${currentSort==='default'?' selected':''}>Sort: Default</option><option value="name-asc"${currentSort==='name-asc'?' selected':''}>Name A→Z</option><option value="name-desc"${currentSort==='name-desc'?' selected':''}>Name Z→A</option><option value="id-asc"${currentSort==='id-asc'?' selected':''}>ID ↑</option><option value="id-desc"${currentSort==='id-desc'?' selected':''}>ID ↓</option><option value="banned-first"${currentSort==='banned-first'?' selected':''}>Banned first</option><option value="verified-first"${currentSort==='verified-first'?' selected':''}>Verified first</option><option value="admin-first"${currentSort==='admin-first'?' selected':''}>Admin first</option></select></div>`;
            if (showActions) {
                html += `<div class="pk-row"><select class="pk-select-dd" id="pk-sel-menu"><option value="">Select...</option><option value="all">All</option><option value="none">None</option><option value="banned">Banned</option><option value="verified">Verified</option><option value="admin">Admin</option><option value="invert">Invert</option></select>`;
                if (showFriend) html += `<button class="pk-btn pk-btn-red" id="pk-bulk" ${selectedIds.size===0?'disabled':''}>Unfriend${selectedIds.size>0?` (${selectedIds.size})`:''}</button>`;
                if (showReq) { html += `<button class="pk-btn pk-btn-green" id="pk-accsel" ${selectedIds.size===0?'disabled':''}>Accept${selectedIds.size>0?` (${selectedIds.size})`:''}</button><button class="pk-btn pk-btn-red" id="pk-ignsel" ${selectedIds.size===0?'disabled':''}>Ignore${selectedIds.size>0?` (${selectedIds.size})`:''}</button>`; }
                html += `</div>`;
            }
            html += `</div><div class="pk-progress" id="pk-progress"></div>`;
            if (users.length === 0) html += `<div class="pk-empty">${currentSearch?`No results for "${pkEsc(currentSearch)}"`:` No ${tab.toLowerCase()}.`}</div>`;
            else { html += `<div class="pk-grid">`; for (const u of users) html += cardHtml(u, showFriend, showReq); html += `</div>`; }
            if (pages > 1) { html += `<div class="pk-pages"><button class="pk-pg" data-p="${currentPage-1}" ${currentPage<=1?'disabled':''}>‹</button>`; for (const p of pageNums(currentPage, pages)) { if (p === '…') html += `<span class="pk-pg-dots">…</span>`; else html += `<button class="pk-pg${p===currentPage?' pk-pg-on':''}" data-p="${p}">${p}</button>`; } html += `<button class="pk-pg" data-p="${currentPage+1}" ${currentPage>=pages?'disabled':''}>›</button></div>`; }
            root.innerHTML = html; bindAll(root);
            if (wasFocused) { const ns = root.querySelector('.pk-search'); if (ns) { ns.focus(); ns.setSelectionRange(curPos, curPos); } }
        }

        function bindAll(root) {
            const se = root.querySelector('.pk-search');
            if (se) { let t; se.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { currentSearch = se.value; currentPage = 1; render(); enrichVisible(); }, 180); }); }
            root.querySelector('#pk-sort')?.addEventListener('change', async function () { currentSort = this.value; currentPage = 1; if (['banned-first','verified-first','admin-first'].includes(currentSort)) await enrichAll(); render(); enrichVisible(); });
            root.querySelector('#pk-sel-menu')?.addEventListener('change', function () {
                const v = this.value, items = filtered();
                if (v==='all') items.forEach(u=>selectedIds.add(u.id)); else if (v==='none') selectedIds.clear(); else if (v==='banned') items.filter(u=>isBanned(u)).forEach(u=>selectedIds.add(u.id)); else if (v==='verified') items.filter(u=>isVerified(u)).forEach(u=>selectedIds.add(u.id)); else if (v==='admin') items.filter(u=>isAdmin(u)).forEach(u=>selectedIds.add(u.id)); else if (v==='invert') items.forEach(u=>{if(selectedIds.has(u.id))selectedIds.delete(u.id);else selectedIds.add(u.id);});
                this.value=''; render();
            });
            root.querySelector('#pk-bulk')?.addEventListener('click', doBulkUnfriend);
            root.querySelector('#pk-accsel')?.addEventListener('click', doAcceptSelected);
            root.querySelector('#pk-ignsel')?.addEventListener('click', doIgnoreSelected);
            root.querySelectorAll('.pk-cb').forEach(cb => { cb.addEventListener('change', () => { const uid = parseInt(cb.dataset.uid); if (cb.checked) selectedIds.add(uid); else selectedIds.delete(uid); cb.closest('.pk-card')?.classList.toggle('pk-sel', cb.checked); const bk=root.querySelector('#pk-bulk'); if(bk){bk.disabled=selectedIds.size===0;bk.textContent=selectedIds.size>0?`Unfriend (${selectedIds.size})`:'Unfriend';} const as=root.querySelector('#pk-accsel'); if(as){as.disabled=selectedIds.size===0;as.textContent=selectedIds.size>0?`Accept (${selectedIds.size})`:'Accept';} const is=root.querySelector('#pk-ignsel'); if(is){is.disabled=selectedIds.size===0;is.textContent=selectedIds.size>0?`Ignore (${selectedIds.size})`:'Ignore';} const st=root.querySelector('.pk-stats'); if(st)st.innerHTML=statsHtml(); }); });
            root.querySelectorAll('.pk-pg[data-p]').forEach(btn => { btn.addEventListener('click', () => { const p = parseInt(btn.dataset.p); if (p>=1) { currentPage=p; render(); enrichVisible(); window.scrollTo({top:root.offsetTop-20,behavior:'smooth'}); } }); });
            root.querySelectorAll('.pk-uf-btn').forEach(btn => { btn.addEventListener('click', async () => { const uid=parseInt(btn.dataset.uid),u=allFriendsData.find(x=>x.id===uid); if(!confirm(`Unfriend ${u?.name||uid}?`))return; btn.disabled=true;btn.textContent='...'; const r=await postApi(`${BASE}/v1/users/${uid}/unfriend`); if(r.ok){allFriendsData=allFriendsData.filter(x=>x.id!==uid);selectedIds.delete(uid);const card=btn.closest('.pk-card');if(card){card.style.opacity='0';card.style.transform='scale(0.95)';}setTimeout(()=>render(),250);}else{btn.textContent='Error';setTimeout(()=>{btn.textContent='Unfriend';btn.disabled=false;},2000);} }); });
            root.querySelectorAll('.pk-acc-btn').forEach(btn => { btn.addEventListener('click', async () => { const uid=parseInt(btn.dataset.uid);btn.disabled=true;btn.textContent='...'; const r=await postApi(`${BASE}/apisite/friends/v1/users/${uid}/accept-friend-request`); if(r.ok){allRequestsData=allRequestsData.filter(x=>x.id!==uid);selectedIds.delete(uid);const card=btn.closest('.pk-card');if(card){card.style.opacity='0';card.style.transform='scale(0.95)';}setTimeout(()=>render(),250);}else{btn.textContent='Error';setTimeout(()=>{btn.textContent='Accept';btn.disabled=false;},2000);} }); });
            root.querySelectorAll('.pk-dec-btn').forEach(btn => { btn.addEventListener('click', async () => { const uid=parseInt(btn.dataset.uid);btn.disabled=true;btn.textContent='...'; const r=await postApi(`${BASE}/apisite/friends/v1/users/${uid}/decline-friend-request`); if(r.ok){allRequestsData=allRequestsData.filter(x=>x.id!==uid);selectedIds.delete(uid);const card=btn.closest('.pk-card');if(card){card.style.opacity='0';card.style.transform='scale(0.95)';}setTimeout(()=>render(),250);}else{btn.textContent='Error';setTimeout(()=>{btn.textContent='Ignore';btn.disabled=false;},2000);} }); });
        }

        async function enrichVisible() {
            const { users } = paged(); if (!users.length) return;
            const ids = users.map(u=>u.id), key = ids.join(',');
            if (isEnriching || enrichedPages.has(key)) return;
            enrichedPages.add(key); isEnriching = true;
            const snapData = getData();
            try {
                await pkGetHeadshots(ids);
                let root = document.getElementById('pk-root');
                if (root) { for (const u of users) { if (headshotCache[u.id]) { const img=root.querySelector(`.pk-card[data-uid="${u.id}"] .pk-avatar`); if(img&&!img.src.includes(headshotCache[u.id]))img.src=headshotCache[u.id]; } } }
                let changed = false;
                await Promise.all(ids.map(async id => {
                    const [det, staff] = await Promise.all([pkGetDetails(id), pkGetStaff(id)]);
                    root = document.getElementById('pk-root'); if (!root) return;
                    const card = root.querySelector(`.pk-card[data-uid="${id}"]`); if (!card) return;
                    const nr = card.querySelector('.pk-name-row'); if (!nr) return;
                    if (det?.hasVerifiedBadge===true && !nr.querySelector('.pk-badge-v')) { const v=document.createElement('span');v.className='icon-verified altIcon-0-2-86 pk-badge-v';v.title='Verified';const nm=nr.querySelector('.pk-name');if(nm)nm.after(v);changed=true; }
                    if (staff===true && !nr.querySelector('.pk-badge-a')) { const a=document.createElement('span');a.className='icon-administrator pk-badge-a';a.title='Admin';const af=nr.querySelector('.pk-badge-v')||nr.querySelector('.pk-name');if(af)af.after(a);changed=true; }
                    if (det?.isBanned===true && !card.classList.contains('pk-ban')) { card.classList.add('pk-ban');if(!nr.querySelector('.pk-badge-ban')){const b=document.createElement('span');b.className='pk-badge-ban';b.textContent='BANNED';nr.appendChild(b);}changed=true; }
                    if (det?.displayName && det.displayName!==(snapData.find(x=>x.id===id)?.name)) { const info=card.querySelector('.pk-info');if(info&&!info.querySelector('.pk-display')){const d=document.createElement('div');d.className='pk-display';d.textContent=`@${det.displayName}`;nr.after(d);} }
                }));
                if (changed) { if (['banned-first','verified-first','admin-first'].includes(currentSort)) render(); else { const st=document.getElementById('pk-root')?.querySelector('.pk-stats');if(st)st.innerHTML=statsHtml(); } }
            } finally { isEnriching = false; }
        }

        async function enrichAll() {
            const allUsers = getData(); if (!allUsers.length) return;
            const ids = allUsers.map(u=>u.id), needDetails = ids.filter(id=>!detailsCache[id]), needStaff = ids.filter(id=>staffCache[id]===undefined);
            if (!needDetails.length && !needStaff.length) return;
            const prog = document.getElementById('pk-progress'); let done=0, total=needDetails.length+needStaff.length;
            const upd = () => { if(prog)prog.textContent=`Loading user data for sort... (${done}/${total})`; }; upd();
            await pkGetHeadshots(ids);
            const BATCH=10;
            for (let i=0;i<needDetails.length;i+=BATCH) await Promise.all(needDetails.slice(i,i+BATCH).map(async id=>{await pkGetDetails(id);done++;upd();}));
            for (let i=0;i<needStaff.length;i+=BATCH) await Promise.all(needStaff.slice(i,i+BATCH).map(async id=>{await pkGetStaff(id);done++;upd();}));
            if (prog) prog.textContent='';
        }

        async function doBulkUnfriend() { if (!selectedIds.size) return; const ids=[...selectedIds]; if(!confirm(`Unfriend ${ids.length} user(s)?`))return; const prog=document.getElementById('pk-progress');let done=0,fail=0; for(const id of ids){try{const r=await postApi(`${BASE}/v1/users/${id}/unfriend`);if(r.ok){done++;allFriendsData=allFriendsData.filter(u=>u.id!==id);selectedIds.delete(id);}else fail++;}catch{fail++;} if(prog){prog.innerHTML=`Unfriending ${done+fail}/${ids.length}${fail?` (${fail} failed)`:''} <span class="pk-bar-wrap"><span class="pk-bar" style="width:${Math.round(((done+fail)/ids.length)*100)}%"></span></span>`;} await pkSleep(200);} if(prog){prog.textContent=`Done! Removed ${done}${fail?`, ${fail} failed`:''}`;setTimeout(()=>{prog.textContent='';},4000);}render(); }
        async function doAcceptSelected() { if (!selectedIds.size) return; const ids=[...selectedIds]; if(!confirm(`Accept ${ids.length} request(s)?`))return; const prog=document.getElementById('pk-progress');let done=0,fail=0; for(const id of ids){try{const r=await postApi(`${BASE}/apisite/friends/v1/users/${id}/accept-friend-request`);if(r.ok){done++;allRequestsData=allRequestsData.filter(u=>u.id!==id);selectedIds.delete(id);}else fail++;}catch{fail++;} if(prog){prog.innerHTML=`Accepting ${done+fail}/${ids.length}${fail?` (${fail} failed)`:''} <span class="pk-bar-wrap"><span class="pk-bar" style="width:${Math.round(((done+fail)/ids.length)*100)}%"></span></span>`;} await pkSleep(150);} if(prog){prog.textContent=`Done! Accepted ${done}${fail?`, ${fail} failed`:''}`;setTimeout(()=>{prog.textContent='';},4000);}render(); }
        async function doIgnoreSelected() { if (!selectedIds.size) return; const ids=[...selectedIds]; if(!confirm(`Ignore ${ids.length} request(s)?`))return; const prog=document.getElementById('pk-progress');let done=0,fail=0; for(const id of ids){try{const r=await postApi(`${BASE}/apisite/friends/v1/users/${id}/decline-friend-request`);if(r.ok){done++;allRequestsData=allRequestsData.filter(u=>u.id!==id);selectedIds.delete(id);}else fail++;}catch{fail++;} if(prog){prog.innerHTML=`Ignoring ${done+fail}/${ids.length}${fail?` (${fail} failed)`:''} <span class="pk-bar-wrap"><span class="pk-bar" style="width:${Math.round(((done+fail)/ids.length)*100)}%"></span></span>`;} await pkSleep(150);} if(prog){prog.textContent=`Done! Ignored ${done}${fail?`, ${fail} failed`:''}`;setTimeout(()=>{prog.textContent='';},4000);}render(); }

        function hideOrig() { document.querySelectorAll('.row.mt-2').forEach(row=>{if(row.querySelector('[class*="friendCardWrapper"]')||row.querySelector('h2')||row.querySelector('[class*="buttonWrapper"]'))row.classList.add('pk-hidden');}); document.querySelectorAll('[class*="buttonWrapper"]').forEach(el=>{const r=el.closest('.row');if(r)r.classList.add('pk-hidden');}); }

        async function initFriends() {
            if (!isCorrectPage()) return;
            const match = window.location.pathname.match(/\/users\/(\d+)\/friends/); if (!match) return;
            const newUid = parseInt(match[1]); if (initialized && newUid === PAGE_USER_ID) return;
            PAGE_USER_ID=newUid; initialized=true;
            allFriendsData=[];allFollowersData=[];allFollowingsData=[];allRequestsData=[];
            selectedIds.clear();enrichedPages.clear();currentPage=1;currentSearch='';currentSort='default';
            document.getElementById('pk-root')?.remove();document.getElementById('pk-styles')?.remove();
            let att=0; while(att<50){if(document.querySelector('[class*="friendCardWrapper"]')||document.querySelector('[class*="friendsContainer"]'))break;await pkSleep(150);att++;}
            if (!isCorrectPage()) return;
            injectStyles();hideOrig();
            const root=document.createElement('div');root.id='pk-root';root.innerHTML='<div class="pk-loading">Loading...</div>';
            const container=document.querySelector('[class*="friendsContainer"]')||document.querySelector('.container.ssp');
            if(container)container.appendChild(root);else document.body.appendChild(root);
            const tab=activeTab();
            if(tab==='Friends')allFriendsData=await fetchFriends(PAGE_USER_ID);
            else if(tab==='Followers')allFollowersData=await fetchPaged('followers',PAGE_USER_ID);
            else if(tab==='Followings')allFollowingsData=await fetchPaged('followings',PAGE_USER_ID);
            else if(tab==='Friend Requests')allRequestsData=await fetchReqs();
            render();enrichVisible();
        }

        setInterval(()=>{if(window.location.href!==lastUrl){lastUrl=window.location.href;if(isCorrectPage()){initialized=false;initFriends();}else{document.getElementById('pk-root')?.remove();document.getElementById('pk-styles')?.remove();initialized=false;}}},500);
        let lastTheme=''; setInterval(()=>{const t=detectTheme();if(t!==lastTheme){lastTheme=t;if(isCorrectPage())injectStyles();}},1500);
        document.addEventListener('click', async(e)=>{if(!e.target.closest('[class*="entry-"]')||!isCorrectPage())return; await pkSleep(300);hideOrig(); const tab=activeTab();currentPage=1;currentSearch='';currentSort='default';selectedIds.clear();enrichedPages.clear(); const root=document.getElementById('pk-root');if(root)root.innerHTML='<div class="pk-loading">Loading...</div>'; if(tab==='Friends'&&allFriendsData.length===0)allFriendsData=await fetchFriends(PAGE_USER_ID); else if(tab==='Followers'&&allFollowersData.length===0)allFollowersData=await fetchPaged('followers',PAGE_USER_ID); else if(tab==='Followings'&&allFollowingsData.length===0)allFollowingsData=await fetchPaged('followings',PAGE_USER_ID); else if(tab==='Friend Requests'&&allRequestsData.length===0)allRequestsData=await fetchReqs(); render();enrichVisible(); });
        new MutationObserver(()=>{if(isCorrectPage()&&document.querySelectorAll('.row.mt-2:not(.pk-hidden) [class*="friendCardWrapper"]').length>0)hideOrig();}).observe(document.body,{childList:true,subtree:true});
        lastUrl=window.location.href; if(isCorrectPage())initFriends();
    })();


    // ============================================================
    // #3 — Old Trades Checker (Dior)
    // ============================================================
    (function () {
        if (!extEnabled(3)) return;
        if (!/\/My\/Trades\.aspx/.test(location.pathname)) return;

        const BASE  = 'https://www.pekora.zip/apisite/trades/v1/trades';
        const THUMB = 'https://www.pekora.zip/apisite/thumbnails/v1';
        const LIMIT = 100;
        let MY_ID   = null;
        let KOLIMON_BY_ID = {};
        let kolimonReady  = false;
        let TM_IMG_KOL = ''; // base64 data URL for kolimon value icon
        let TM_IMG_RAP = ''; // base64 data URL for RAP icon
        let TM_IMG_ROBUX = ''; // base64 data URL for robux icon
        function fetchImgAsDataUrl(url,cb){GM_xmlhttpRequest({method:'GET',url:url,responseType:'blob',onload:function(r){const reader=new FileReader();reader.onload=function(){cb(reader.result);};reader.readAsDataURL(r.response);},onerror:function(){cb('');}});}
        fetchImgAsDataUrl('https://koromons.xyz/images/logo.png',function(d){TM_IMG_KOL=d;});
        fetchImgAsDataUrl('https://files.catbox.moe/lb9oyq.webp',function(d){TM_IMG_RAP=d;});
        fetchImgAsDataUrl('https://koromons.xyz/svg/robux.svg',function(d){TM_IMG_ROBUX=d;});

        function fetchKolimonValues() {
            return new Promise(function(resolve) {
                GM_xmlhttpRequest({ method:'GET', url:'https://koromons.xyz/api/items', headers:{'Accept':'application/json'}, onload:function(r){ try{ const data=JSON.parse(r.responseText); const items=Array.isArray(data)?data:[]; items.forEach(function(entry){ if(entry&&entry.itemId){ KOLIMON_BY_ID[String(entry.itemId)]={assetId:String(entry.itemId),value:entry.Value||0,demand:(entry.Demand||'').toLowerCase()}; } }); kolimonReady=true; }catch(e){} resolve(); }, onerror:function(){resolve();} });
            });
        }
        fetchKolimonValues();

        function getKolVal(assetId) { const e=KOLIMON_BY_ID[assetId]; return (e&&e.value)?e.value:0; }
        function getEffVal(asset) { return getKolVal(asset.assetId)||(asset.recentAveragePrice||0); }
        function totalKolVal(assets) { return assets.reduce(function(s,a){return s+getEffVal(a);},0); }

        function tApiFetch(url) { return new Promise(function(resolve,reject){ GM_xmlhttpRequest({method:'GET',url:url,withCredentials:true,headers:{'Accept':'application/json'},onload:function(r){if(r.status>=400){reject(new Error('HTTP '+r.status));return;}try{resolve(JSON.parse(r.responseText));}catch(e){reject(new Error('Bad JSON'));}},onerror:function(){reject(new Error('Network error'));}}); }); }

        var tmCsrf='';
        function tApiPost(url){return new Promise(function(resolve,reject){function doPost(csrf){var h={'Accept':'application/json','Content-Type':'application/json'};if(csrf)h['x-csrf-token']=csrf;GM_xmlhttpRequest({method:'POST',url:url,withCredentials:true,headers:h,data:'{}',onload:function(r){if(r.status===403){var m=(r.responseHeaders||'').match(/x-csrf-token:\s*([^\r\n]+)/i);var nc=m?m[1].trim():'';if(nc&&nc!==csrf){tmCsrf=nc;doPost(nc);return;}reject(new Error('HTTP 403'));return;}if(r.status>=400){reject(new Error('HTTP '+r.status));return;}resolve(r);},onerror:function(){reject(new Error('Network error'));}});}doPost(tmCsrf);});}

        tApiFetch('https://www.pekora.zip/apisite/users/v1/users/authenticated').then(function(d){MY_ID=d.id;}).catch(function(){});

        function waitFor(sel,cb){const el=document.querySelector(sel);if(el)return cb(el);const obs=new MutationObserver(function(){const el2=document.querySelector(sel);if(el2){obs.disconnect();cb(el2);}});obs.observe(document.body,{childList:true,subtree:true});}

        async function fetchAllTrades(type){let all=[],cursor='';while(true){const data=await tApiFetch(BASE+'/'+type+'?cursor='+encodeURIComponent(cursor)+'&limit='+LIMIT);const items=data.data||data.trades||data.items||[];all=all.concat(items);const next=data.nextPageCursor||data.nextCursor||null;if(!next||items.length===0)break;cursor=next;}return all;}
        function fetchAvatar(userId){return tApiFetch(THUMB+'/users/avatar-headshot?userIds='+userId+'&size=150x150&format=Png').then(function(d){return(d.data&&d.data[0]&&d.data[0].imageUrl)||'';}).catch(function(){return'';});}
        function fetchAssetThumbs(assetIds){if(!assetIds.length)return Promise.resolve({});return tApiFetch(THUMB+'/assets?assetIds='+assetIds.join(',')+'&size=110x110&format=Png').then(function(d){const map={};(d.data||[]).forEach(function(e){map[e.targetId]=e.imageUrl;});return map;}).catch(function(){return{};});}
        function fmt(s){if(!s)return'—';const d=new Date(s);return(d.getMonth()+1)+'/'+d.getDate()+'/'+String(d.getFullYear()).slice(2);}
        function fmtRap(n){if(n==null)return'N/A';if(n>=1000)return(n/1000).toFixed(1).replace(/\.0$/,'')+' K';return String(n);}
        function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
        function absUrl(url){if(!url)return'';return url.startsWith('http')?url:'https://www.pekora.zip'+url;}

        const tradeStyle = document.createElement('style');
        tradeStyle.textContent = `
            .tm-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center}
            .tm-modal{background:#222;border-radius:12px;width:760px;max-width:calc(100vw - 32px);max-height:calc(100vh - 40px);overflow:hidden;position:relative;font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#e0e0e0;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.9)}
            .tm-modal-title{text-align:center;font-size:17px;font-weight:800;color:#fff;padding:14px 52px;background:#222;border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0}
            .tm-modal-close{position:absolute;top:10px;right:13px;cursor:pointer;font-size:11px;font-weight:900;color:#aaa;width:23px;height:23px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px solid #777;line-height:1}
            .tm-modal-close:hover{color:#fff;border-color:#fff}
            .tm-modal-body{display:flex;flex:1;overflow:hidden;min-height:0}
            .tm-sidebar{width:160px;flex-shrink:0;background:#1a1a1a;border-right:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;align-items:center;padding:18px 12px;gap:0}
            .tm-sidebar img.tm-avatar{width:115px;height:115px;border-radius:8px;object-fit:cover;display:block;margin-bottom:11px;background:#333}
            .tm-sidebar .tm-trade-status{font-size:12px;text-align:center;color:#ccc;line-height:1.5;margin-bottom:10px;word-break:break-word}
            .tm-sidebar .tm-trade-status .tm-partner-link{color:#fff;font-weight:800;text-decoration:none}
            .tm-sidebar .tm-trade-status .tm-partner-link:hover{text-decoration:underline}
            .tm-sidebar .tm-diff{font-size:16px;font-weight:800;margin-bottom:10px}
            .tm-sidebar .tm-diff.pos{color:#00e87e}.tm-sidebar .tm-diff.neg{color:#f4645d}.tm-sidebar .tm-diff.neu{color:#666}
            .tm-sidebar-valrow{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;width:100%;margin-bottom:3px;color:#fff!important}
            .tm-sidebar-valrow.kol{color:#4a9eff!important}
            .tm-sidebar-valrow.rap{color:#2ec27e!important}
            .tm-sidebar-lbl{font-size:10px;color:#888;margin-bottom:2px;width:100%}
            .tm-content{flex:1;overflow-y:auto;overflow-x:hidden;padding:16px 18px;display:flex;flex-direction:column;background:#222}
            .tm-content::-webkit-scrollbar{width:0}
            .tm-section-label{font-size:13px;font-weight:800;color:#fff;margin:0 0 10px;letter-spacing:0.01em}
            .tm-item-grid{display:flex;gap:10px;flex-wrap:nowrap;margin-bottom:8px;align-items:flex-start}
            .tm-slot{width:118px;flex-shrink:0;display:flex;flex-direction:column}
            .tm-slot.empty{width:118px;height:170px}
            .tm-slot-img-wrap{position:relative;width:118px;height:118px;background:#2a2a2a;border-radius:8px;overflow:hidden;flex-shrink:0}
            .tm-slot-img-wrap img{width:118px;height:118px;object-fit:contain;display:block}
            .tm-slot-serial{position:absolute;bottom:5px;left:4px;background:rgba(10,10,10,0.85);border-radius:4px;font-size:9px;font-weight:700;color:#ffd700;padding:1px 5px;line-height:1.4;white-space:nowrap}
            .tm-slot-uaid{position:absolute;bottom:5px;left:4px;background:rgba(10,10,10,0.85);border-radius:4px;font-size:8px;font-weight:600;color:#aaa;padding:1px 5px;line-height:1.4;white-space:nowrap}
            .tm-slot-name{font-size:11px;color:#fff!important;font-weight:700;margin:6px 0 4px;line-height:1.35;word-break:break-word;max-width:118px}
            .tm-slot-name a{color:#fff!important;text-decoration:none}
            .tm-slot-name a:hover{color:#4a9eff}
            .tm-slot-val-row{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;line-height:1.6;color:#fff}
            .tm-slot-val-row.rap{color:#3ab4f2}
            .tm-val-icon{width:14px;height:14px;flex-shrink:0;display:inline-block;background-size:contain;background-repeat:no-repeat;background-position:center;border-radius:0}
            .tm-val-icon.blue{background-image:url('https://koromons.xyz/images/logo.png')}
            .tm-val-icon.green{background-image:url('https://files.catbox.moe/lb9oyq.webp')}
            .tm-section-total{display:flex;justify-content:space-between;align-items:flex-start;margin:6px 0 16px}
            .tm-section-total-label{font-size:12px;color:#bbb!important;font-weight:600;padding-top:2px}
            .tm-section-total-vals{display:flex;flex-direction:column;align-items:flex-end;gap:3px}
            .tm-section-total-kol{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:800;color:#fff!important}
            .tm-section-total-rap{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:800;color:#2ec27e!important}
            .tm-divider{border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 16px}
            .tm-modal-footer{display:flex;justify-content:center;gap:10px;padding:14px 18px;border-top:1px solid rgba(255,255,255,0.07);background:#1a1a1a;flex-shrink:0}
            .tm-btn-ok{background:#2d7d46;color:#fff;border:none;border-radius:8px;padding:9px 28px;font-size:14px;font-weight:800;cursor:pointer}
            .tm-btn-ok:hover{background:#369952}
            .tm-btn-accept{background:#2d7d46;color:#fff;border:none;border-radius:8px;padding:9px 28px;font-size:14px;font-weight:800;cursor:pointer}
            .tm-btn-accept:hover{background:#369952}
            .tm-btn-counter{background:transparent;color:#fff;border:2px solid #555;border-radius:8px;padding:9px 28px;font-size:14px;font-weight:800;cursor:pointer}
            .tm-btn-counter:hover{border-color:#999;background:rgba(255,255,255,0.05)}
            .tm-btn-decline{background:transparent;color:#fff;border:2px solid #555;border-radius:8px;padding:9px 28px;font-size:14px;font-weight:800;cursor:pointer}
            .tm-btn-decline:hover{border-color:#999;background:rgba(255,255,255,0.05)}
            .tm-btn-accept:disabled,.tm-btn-counter:disabled,.tm-btn-decline:disabled{opacity:0.4;cursor:default}
            .tm-loading-row td{color:#555;font-size:12px;text-align:center;padding:10px!important}
            .tm-injected td{cursor:default}
            .tm-injected .tm-partner-cell{display:flex;align-items:center;gap:8px}
            .tm-injected .tm-partner-cell img{width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0}
            .tm-injected .tm-partner-cell p{margin:0}
            .tm-view-btn{background:none;border:none;padding:0;color:inherit;font:inherit;cursor:pointer}
        `;
        document.head.appendChild(tradeStyle);

        function openModal(trade) {
            document.querySelector('.tm-modal-bg')?.remove();
            const tradeStatus=(trade.status||'').toLowerCase(); const tradeType=(trade.tradeType||'').toLowerCase(); const isInbound=tradeType==='inbound'||tradeStatus==='open'||tradeStatus==='countered';
            const bg=document.createElement('div'); bg.className='tm-modal-bg';
            const modal=document.createElement('div'); modal.className='tm-modal';
            const titleEl=document.createElement('div'); titleEl.className='tm-modal-title'; titleEl.textContent='Trade Request'; modal.appendChild(titleEl);
            const closeEl=document.createElement('div'); closeEl.className='tm-modal-close'; closeEl.textContent='✕'; modal.appendChild(closeEl);
            // body = sidebar + content
            const body=document.createElement('div'); body.className='tm-modal-body';
            const sidebar=document.createElement('div'); sidebar.className='tm-sidebar';
            sidebar.innerHTML='<div style="color:#666;font-size:12px;text-align:center;">Loading…</div>';
            const content=document.createElement('div'); content.className='tm-content';
            body.appendChild(sidebar); body.appendChild(content); modal.appendChild(body);
            // footer
            const footer=document.createElement('div'); footer.className='tm-modal-footer';
            if(isInbound){
                const acceptBtn=document.createElement('button'); acceptBtn.className='tm-btn-accept'; acceptBtn.textContent='Accept';
                const counterBtn=document.createElement('button'); counterBtn.className='tm-btn-counter'; counterBtn.textContent='Counter';
                const declineBtn=document.createElement('button'); declineBtn.className='tm-btn-decline'; declineBtn.textContent='Decline';
                function disableAll(){[acceptBtn,counterBtn,declineBtn].forEach(function(x){x.disabled=true;});}
                acceptBtn.addEventListener('click',function(){disableAll();acceptBtn.textContent='…';tApiPost('https://www.pekora.zip/apisite/trades/v1/trades/'+trade.id+'/accept').then(function(){acceptBtn.textContent='✓ Accepted';setTimeout(function(){bg.remove();location.reload();},900);}).catch(function(err){[acceptBtn,counterBtn,declineBtn].forEach(function(x){x.disabled=false;});acceptBtn.textContent='Accept';alert('Accept failed: '+err.message);});});
                declineBtn.addEventListener('click',function(){disableAll();declineBtn.textContent='…';tApiPost('https://www.pekora.zip/apisite/trades/v1/trades/'+trade.id+'/decline').then(function(){declineBtn.textContent='✓ Declined';setTimeout(function(){bg.remove();location.reload();},900);}).catch(function(err){[acceptBtn,counterBtn,declineBtn].forEach(function(x){x.disabled=false;});declineBtn.textContent='Decline';alert('Decline failed: '+err.message);});});
                counterBtn.addEventListener('click',function(){var pid=trade.user?trade.user.id:'';var url='https://www.pekora.zip/Trade/TradeWindow.aspx?TradeSessionId='+trade.id+'&TradePartnerID='+pid;window.open(url,'_blank','popup,width=900,height=700,scrollbars=yes,resizable=yes');});
                footer.appendChild(acceptBtn); footer.appendChild(counterBtn); footer.appendChild(declineBtn);
            } else {
                const okBtn=document.createElement('button'); okBtn.className='tm-btn-ok'; okBtn.textContent='OK';
                okBtn.addEventListener('click',function(){bg.remove();}); footer.appendChild(okBtn);
            }
            modal.appendChild(footer); bg.appendChild(modal); document.body.appendChild(bg);
            function close(){bg.remove();}
            closeEl.addEventListener('click',close);
            bg.addEventListener('click',function(e){if(e.target===bg)close();});
            document.addEventListener('keydown',function onKey(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',onKey);}});

            tApiFetch('https://www.pekora.zip/apisite/trades/v1/trades/'+trade.id).then(async function(t){
                const offers=t.offers||[];
                const myOffer=offers.find(function(o){return MY_ID&&o.user&&o.user.id===MY_ID;})||offers[0]||{userAssets:[]};
                const theirOffer=offers.find(function(o){return !MY_ID||!o.user||o.user.id!==MY_ID;})||offers[1]||{userAssets:[]};
                const myAssets=myOffer.userAssets||[]; const theirAssets=theirOffer.userAssets||[];
                const partner=theirOffer.user||{}; const partnerName=partner.displayName||partner.name||'Unknown'; const partnerId=partner.id;
                const allIds=[...myAssets,...theirAssets].map(function(a){return a.assetId;}).filter(Boolean);
                const [avatarUrl,thumbMap]=await Promise.all([partnerId?fetchAvatar(partnerId):Promise.resolve(''),fetchAssetThumbs(allIds)]);
                const myVal=totalKolVal(myAssets), theirVal=totalKolVal(theirAssets);
                const myRap=myAssets.reduce(function(s,a){return s+(a.recentAveragePrice||0);},0);
                const theirRap=theirAssets.reduce(function(s,a){return s+(a.recentAveragePrice||0);},0);
                const myRobux=myOffer.robuxAmount||myOffer.robux||0;
                const theirRobux=theirOffer.robuxAmount||theirOffer.robux||0;
                const valDiff=theirVal-myVal;
                const valDiffStr=(valDiff>=0?'+':'')+valDiff.toLocaleString();
                const valDiffCls=valDiff>0?'pos':valDiff<0?'neg':'neu';

                // — Sidebar —
                sidebar.innerHTML='';
                const av=document.createElement('img'); av.className='tm-avatar'; av.alt=partnerName;
                av.src=avatarUrl?absUrl(avatarUrl):''; sidebar.appendChild(av);
                const statusEl=document.createElement('div'); statusEl.className='tm-trade-status';
                statusEl.innerHTML='<a class="tm-partner-link" href="/User.aspx?ID='+(partnerId||'')+'">'+escHtml(partnerName)+'</a>'+(isInbound?' sent you a trade!':' — trade '+escHtml(t.status||''));
                sidebar.appendChild(statusEl);
                const diffEl=document.createElement('div'); diffEl.className='tm-diff '+valDiffCls; diffEl.textContent=valDiffStr+' Value'; sidebar.appendChild(diffEl);
                // "You're offering" values
                const lbl1=document.createElement('div'); lbl1.style.cssText='font-size:10px;color:#888;margin-bottom:2px;width:100%'; lbl1.textContent="You're offering:"; sidebar.appendChild(lbl1);
                function sideValRow(type,val){const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;width:100%;margin-bottom:3px;color:'+(type==='kol'?'#4a9eff':'#2ec27e');const ic=document.createElement('img');ic.style.cssText='width:13px;height:13px;flex-shrink:0;object-fit:contain';ic.src=type==='kol'?(TM_IMG_KOL||'https://koromons.xyz/images/logo.png'):(TM_IMG_RAP||'https://files.catbox.moe/lb9oyq.webp');ic.alt=type==='kol'?'V':'R';row.appendChild(ic);const sp=document.createElement('span');sp.style.cssText='color:'+(type==='kol'?'#4a9eff':'#2ec27e');sp.textContent=val.toLocaleString();row.appendChild(sp);return row;}
                function sideRobuxRow(amount){const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;width:100%;margin-bottom:3px;color:#00e87e';const ic=document.createElement('img');ic.src=(TM_IMG_ROBUX||'https://koromons.xyz/svg/robux.svg');ic.style.cssText='width:13px;height:13px;flex-shrink:0;object-fit:contain';row.appendChild(ic);const sp=document.createElement('span');sp.style.cssText='color:#00e87e';sp.textContent=amount.toLocaleString();row.appendChild(sp);return row;}
                sidebar.appendChild(sideValRow('kol',isInbound?myVal:myVal));
                sidebar.appendChild(sideValRow('rap',isInbound?myRap:myRap));
                if(isInbound?myRobux:myRobux)sidebar.appendChild(sideRobuxRow(isInbound?myRobux:myRobux));
                const lbl2=document.createElement('div'); lbl2.style.cssText='font-size:10px;color:#888;margin:8px 0 2px;width:100%'; lbl2.textContent="They're offering:"; sidebar.appendChild(lbl2);
                sidebar.appendChild(sideValRow('kol',isInbound?theirVal:theirVal));
                sidebar.appendChild(sideValRow('rap',isInbound?theirRap:theirRap));
                if(isInbound?theirRobux:theirRobux)sidebar.appendChild(sideRobuxRow(isInbound?theirRobux:theirRobux));

                // — Content —
                function valIcon(type){const s=document.createElement('img');s.style.cssText='width:14px;height:14px;flex-shrink:0;display:inline-block;vertical-align:middle;object-fit:contain;border-radius:0';s.src=type==='kol'?(TM_IMG_KOL||'https://koromons.xyz/images/logo.png'):(TM_IMG_RAP||'https://files.catbox.moe/lb9oyq.webp');s.alt=type==='kol'?'V':'R';return s;}
                function buildSection(label,assets,kolTotal,rapTotal,robuxAmt){
                    const sec=document.createElement('div');
                    const lbl=document.createElement('div'); lbl.style.cssText='font-size:13px;font-weight:800;color:#fff;margin:0 0 10px;letter-spacing:0.01em'; lbl.textContent=label; sec.appendChild(lbl);
                    const grid=document.createElement('div'); grid.style.cssText='display:flex;gap:10px;flex-wrap:nowrap;margin-bottom:8px;align-items:flex-start';
                    for(let i=0;i<Math.min(assets.length,5);i++){
                        const a=assets[i]; const slot=document.createElement('div'); slot.style.cssText='width:118px;flex-shrink:0;display:flex;flex-direction:column';
                        const kolVal=getKolVal(a.assetId); const rap=a.recentAveragePrice||0;
                        const slug=(a.name||'').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
                        const imgWrap=document.createElement('div'); imgWrap.style.cssText='position:relative;width:118px;height:118px;background:#2a2a2a;border-radius:8px;overflow:hidden;flex-shrink:0';
                        const img=document.createElement('img'); img.alt=a.name||''; img.style.cssText='width:118px;height:118px;object-fit:contain;display:block';
                        const thumb=thumbMap[a.assetId]; if(thumb)img.src=absUrl(thumb);
                        imgWrap.appendChild(img);
                        if(a.serialNumber){const serial=document.createElement('span');serial.style.cssText='position:absolute;bottom:5px;left:4px;background:rgba(10,10,10,0.85);border-radius:4px;font-size:9px;font-weight:700;color:#ffd700;padding:1px 5px;line-height:1.4;white-space:nowrap';serial.textContent='#'+a.serialNumber;imgWrap.appendChild(serial);}else if(a.userAssetId){const uaid=document.createElement('span');uaid.style.cssText='position:absolute;bottom:5px;left:4px;background:rgba(10,10,10,0.85);border-radius:4px;font-size:8px;font-weight:600;color:#aaa;padding:1px 5px;line-height:1.4;white-space:nowrap';uaid.textContent='UAID:'+a.userAssetId;imgWrap.appendChild(uaid);}
                        slot.appendChild(imgWrap);
                        const nameDiv=document.createElement('div'); nameDiv.style.cssText='font-size:11px;font-weight:700;margin:6px 0 4px;line-height:1.35;word-break:break-word;max-width:118px';
                        const nameA=document.createElement('a'); nameA.href='/catalog/'+a.assetId+'/'+slug; nameA.style.cssText='color:#fff;text-decoration:none'; nameA.textContent=a.name||'?';
                        nameDiv.appendChild(nameA); slot.appendChild(nameDiv);
                        const kr=document.createElement('div'); kr.style.cssText='display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;line-height:1.6;color:#4a9eff';
                        kr.appendChild(valIcon('kol')); const ks=document.createElement('span'); ks.style.color='#4a9eff'; ks.textContent=(kolVal||rap).toLocaleString(); kr.appendChild(ks); slot.appendChild(kr);
                        const rr=document.createElement('div'); rr.style.cssText='display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;line-height:1.6;color:#2ec27e';
                        rr.appendChild(valIcon('rap')); const rs=document.createElement('span'); rs.style.color='#2ec27e'; rs.textContent=rap.toLocaleString(); rr.appendChild(rs); slot.appendChild(rr);
                        grid.appendChild(slot);
                    }
                    if(robuxAmt){

                    }
                    sec.appendChild(grid);
                    const tot=document.createElement('div'); tot.style.cssText='display:flex;justify-content:space-between;align-items:flex-start;margin:6px 0 16px';
                    const totLbl=document.createElement('span'); totLbl.style.cssText='font-size:12px;color:#bbb;font-weight:600;padding-top:2px'; totLbl.textContent='Total Value:';
                    const totVals=document.createElement('div'); totVals.style.cssText='display:flex;flex-direction:column;align-items:flex-end;gap:3px';
                    const tKol=document.createElement('div'); tKol.style.cssText='display:flex;align-items:center;gap:5px;font-size:13px;font-weight:800;color:#4a9eff'; tKol.appendChild(valIcon('kol')); const tkS=document.createElement('span'); tkS.style.color='#4a9eff'; tkS.textContent=kolTotal.toLocaleString(); tKol.appendChild(tkS);
                    const tRap=document.createElement('div'); tRap.style.cssText='display:flex;align-items:center;gap:5px;font-size:13px;font-weight:800;color:#2ec27e'; tRap.appendChild(valIcon('rap')); const trS=document.createElement('span'); trS.style.color='#2ec27e'; trS.textContent=rapTotal.toLocaleString(); tRap.appendChild(trS);
                    totVals.appendChild(tKol); totVals.appendChild(tRap);
                    tot.appendChild(totLbl); tot.appendChild(totVals); sec.appendChild(tot);
                    if(robuxAmt){const robuxRow=document.createElement('div');robuxRow.style.cssText='display:flex;justify-content:space-between;align-items:center;margin:-10px 0 16px;padding:0 0 0 0';const robuxLbl=document.createElement('span');robuxLbl.style.cssText='font-size:12px;color:#00e87e;font-weight:700';robuxLbl.textContent='Robux Offered:';const robuxRight=document.createElement('div');robuxRight.style.cssText='display:flex;align-items:center;gap:5px;font-size:13px;font-weight:800;color:#00e87e';const rIcon=document.createElement('img');rIcon.src=(TM_IMG_ROBUX||'https://koromons.xyz/svg/robux.svg');rIcon.style.cssText='width:14px;height:14px;object-fit:contain;flex-shrink:0';const rNum=document.createElement('span');rNum.style.color='#00e87e';rNum.textContent=robuxAmt.toLocaleString();robuxRight.appendChild(rIcon);robuxRight.appendChild(rNum);robuxRow.appendChild(robuxLbl);robuxRow.appendChild(robuxRight);sec.appendChild(robuxRow);}
                    return sec;
                }
                const giveAssets=myAssets, giveKol=myVal, giveRap=myRap, giveRobux=myRobux;
                const recvAssets=theirAssets, recvKol=theirVal, recvRap=theirRap, recvRobux=theirRobux;

                content.innerHTML='';
                content.appendChild(buildSection('Items you will give',giveAssets,giveKol,giveRap,giveRobux));
                const hr=document.createElement('hr'); hr.style.cssText='border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 16px'; content.appendChild(hr);
                content.appendChild(buildSection('Items you will receive',recvAssets,recvKol,recvRap,recvRobux));
            }).catch(function(e){sidebar.innerHTML='';content.innerHTML='<div style="color:#f4645d;padding:30px;text-align:center;">Error: '+escHtml(e.message)+'</div>';});
        }

        function makeTradeRow(trade){
            const tr=document.createElement('tr'); tr.className='row-0-2-116 tm-injected'; tr._tmTrade=trade;
            const partner=trade.user?(trade.user.displayName||trade.user.name||'Unknown'):'Unknown';
            const partnerId=trade.user?trade.user.id:null;
            function tdBasic(text){const td=document.createElement('td');td.className='td-0-2-117';td.textContent=text;return td;}
            tr.appendChild(tdBasic(fmt(trade.created))); tr.appendChild(tdBasic(fmt(trade.expiration)));
            const tdPartner=document.createElement('td'); tdPartner.className='td-0-2-117';
            const partnerWrap=document.createElement('div'); partnerWrap.className='tm-partner-cell';
            const img=document.createElement('img'); img.alt=partner; img.src='';
            const nameP=document.createElement('p'); nameP.className='senderName-0-2-120'; nameP.textContent=partner;
            partnerWrap.appendChild(img); partnerWrap.appendChild(nameP); tdPartner.appendChild(partnerWrap); tr.appendChild(tdPartner);
            if(partnerId)fetchAvatar(partnerId).then(function(url){if(url)img.src=absUrl(url);});
            tr.appendChild(tdBasic(trade.status||'—'));
            const tdAction=document.createElement('td'); tdAction.className='td-0-2-117';
            const btn=document.createElement('button'); btn.className='tm-view-btn'; btn.textContent='View Details'; tdAction.appendChild(btn); tr.appendChild(tdAction);
            return tr;
        }

        document.addEventListener('click',function(e){if(!extEnabled(3))return;const btn=e.target.closest('.tm-view-btn');if(!btn)return;const row=btn.closest('tr.tm-injected');if(!row||!row._tmTrade)return;e.stopImmediatePropagation();e.preventDefault();openModal(row._tmTrade);},true);

        function clearInjected(tbody){
            tbody.querySelectorAll('.tm-injected,.tm-loading-row').forEach(function(el){el.remove();});
            tbody.querySelectorAll('tr:not(.tm-injected):not(.tm-loading-row)').forEach(function(el){el.style.display='';});
        }

        async function loadType(type,tbody){
            clearInjected(tbody);
            const loadingTr=document.createElement('tr'); loadingTr.className='tm-loading-row'; loadingTr.innerHTML='<td colspan="5" style="text-align:center;padding:10px;color:#555">Loading '+type+' trades…</td>'; tbody.appendChild(loadingTr);
            try{
                const trades=await fetchAllTrades(type); loadingTr.remove();
                if(trades.length===0){const e=document.createElement('tr');e.className='tm-loading-row';e.innerHTML='<td colspan="5" style="text-align:center;padding:10px;color:#555">No '+type+' trades</td>';tbody.appendChild(e);}
                else{trades.forEach(function(trade){tbody.appendChild(makeTradeRow(trade));});tbody.querySelectorAll('tr:not(.tm-injected):not(.tm-loading-row)').forEach(function(el){el.style.display='none';});}
            }catch(e){loadingTr.remove();const er=document.createElement('tr');er.className='tm-loading-row';er.innerHTML='<td colspan="5" style="text-align:center;padding:10px;color:#e05252">Error: '+escHtml(e.message)+'</td>';tbody.appendChild(er);}
        }

        waitFor('select.tradeTypeActions-0-2-50',function(select){waitFor('table.table-0-2-51 tbody',function(tbody){select.addEventListener('change',function(){loadType(select.value,tbody);});loadType(select.value,tbody);});});

        new MutationObserver(function(){var bg=document.querySelector('[class*="modalBg-"]');if(bg&&bg.offsetParent!==null){bg.style.setProperty('display','none','important');}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});

    })();


    // ============================================================
    // #4 — Enhanced Place Settings (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(4)) return;
        function getPlaceId(path) { const m = (path||location.pathname).match(/\/places\/(\d+)\/update/); return m ? m[1] : null; }
        function isUpdatePage(path) { return !!getPlaceId(path||location.pathname); }

        async function epsApiFetch(url, method='GET', body=null) {
            const opts = { method, headers: {'Content-Type':'application/json'}, credentials:'include' };
            if (body) opts.body = JSON.stringify(body);
            const r = await fetch(url, opts);
            if (!r.ok) throw new Error(`${method} ${url} → ${r.status}`);
            try { return await r.json(); } catch { return {}; }
        }

        function makeLabel(text) { const p=document.createElement('p'); p.className='mb-0 fw-bold mt-2'; p.textContent=text; return p; }

        const OUR_BTN_IDS = ['es-save','es-cancel','es-perms-add-btn','es-vh-next','es-vh-prev'];
        function liveClass(pat,excludeIds=[]) { for (const btn of document.querySelectorAll('button')) { if(excludeIds.includes(btn.id))continue; if(pat.test(btn.className))return btn.className; } return null; }
        const saveBtnClass   = () => liveClass(/continueButton/, OUR_BTN_IDS);
        const cancelBtnClass = () => liveClass(/cancelButton/, OUR_BTN_IDS);

        function makeBtn(label, id, type, onClick) {
            const btn=document.createElement('button'); btn.id=id; btn.type='button'; btn.textContent=label;
            const cls=type==='save'?saveBtnClass():cancelBtnClass(); if(cls)btn.className=cls;
            btn.addEventListener('click',onClick);
            new MutationObserver(()=>{const fresh=type==='save'?saveBtnClass():cancelBtnClass();if(fresh&&fresh!==btn.className)btn.className=fresh;}).observe(btn,{attributes:true,attributeFilter:['class']});
            return btn;
        }
        function wrapBtn(btn,side='save'){const o=document.createElement('div');o.className=side==='save'?'d-inline-block':'d-inline-block ms-4';const i=document.createElement('div');i.appendChild(btn);o.appendChild(i);return o;}

        let _cachedSelectClass=null;
        function getLiveSelectClass(){if(_cachedSelectClass!==null)return _cachedSelectClass;const ssp=getSSP();if(!ssp)return null;const ours=new Set(['es-visibility','es-avatar','es-teamcreate']);for(const s of ssp.querySelectorAll('select')){if(!ours.has(s.id)){_cachedSelectClass=s.className||'';return _cachedSelectClass;}}return null;}
        function makeSelect(options,cur){const sel=document.createElement('select');const cls=getLiveSelectClass();if(cls)sel.className=cls;for(const{value,label}of options){const o=document.createElement('option');o.value=value;o.textContent=label;if(value===String(cur))o.selected=true;sel.appendChild(o);}return sel;}
        function syncSelectClasses(){_cachedSelectClass=null;const cls=getLiveSelectClass();['es-visibility','es-avatar','es-teamcreate'].forEach(id=>{const s=document.getElementById(id);if(!s)return;if(cls){if(s.className!==cls)s.className=cls;}else s.removeAttribute('class');});}

        function epsToast(msg,ok=true){const t=document.createElement('div');t.textContent=msg;Object.assign(t.style,{position:'fixed',bottom:'24px',right:'24px',zIndex:99999,background:ok?'#198754':'#dc3545',color:'#fff',padding:'10px 18px',borderRadius:'6px',fontSize:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.35)',transition:'opacity .4s'});document.body.appendChild(t);setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),500);},2800);}

        function injectTableCSS(){if(document.getElementById('es-table-style'))return;const style=document.createElement('style');style.id='es-table-style';style.textContent=`table.es-table{width:100%;border-collapse:collapse}table.es-table thead{background:var(--white-color-hover);border-top:1px solid #b9b9b9;border-bottom:2px solid var(--background-color)}table.es-table th{color:var(--text-color-primary);padding:5px;border-right:2px solid #e1e1e1;font-weight:normal;text-align:left}table.es-table th:last-child{border-right:none}table.es-table tbody tr{border-bottom:1px solid var(--white-color-hover)}table.es-table td{padding:5px;color:var(--text-color-primary);font-size:14px;vertical-align:middle}`;document.head.appendChild(style);}
        function makeTable(headers,widths){injectTableCSS();const table=document.createElement('table');table.className='es-table';const thead=document.createElement('thead');const headRow=document.createElement('tr');headers.forEach(h=>{const th=document.createElement('th');th.textContent=h;headRow.appendChild(th);});thead.appendChild(headRow);table.appendChild(thead);const tbody=document.createElement('tbody');table.appendChild(tbody);return{table,tbody};}
        function makeRow(cells,widths){const tr=document.createElement('tr');cells.forEach((content,i)=>{const td=document.createElement('td');if(widths&&widths[i])td.style.width=widths[i];if(content===null||content===undefined||content===''){}else if(typeof content==='string'||typeof content==='number'){td.textContent=String(content);}else if(content instanceof HTMLElement){td.appendChild(content);}else if(content&&content.html){td.innerHTML=content.html;}tr.appendChild(td);});return tr;}
        function applyLiveClassesToTable(){}

        let universeId=null,placeIdStr=null,universeConfig={},originalValues={};
        let epsInjected=false,ourPanelActive=false,sidebarObs=null,mutating=false;
        let epsLastPath=location.pathname;
        const SC={wrapper:'',selected:'',disabled:'',text:'',textSelected:''};

        function detectSidebarClasses(col){for(const a of col.querySelectorAll('a')){for(const c of a.classList){if(!SC.wrapper&&/^wrapper-0-2-\d+$/.test(c))SC.wrapper=c;if(!SC.selected&&/^wrapperSelected-0-2-\d+$/.test(c))SC.selected=c;if(!SC.disabled&&/^wrapperDisabled-0-2-\d+$/.test(c))SC.disabled=c;}const sp=a.querySelector('span');if(sp)for(const c of sp.classList){if(!SC.text&&/^text-0-2-\d+$/.test(c))SC.text=c;if(!SC.textSelected&&/^textSelected-0-2-\d+$/.test(c))SC.textSelected=c;}}}
        function scAdd(el,cls){if(el&&cls)el.classList.add(cls);}
        function scRemove(el,cls){if(el&&cls)el.classList.remove(cls);}
        function scHas(el,cls){return!!(el&&cls&&el.classList.contains(cls));}
        function scDisabledSel(){return SC.disabled?`.${SC.disabled}`:'[data-es-never]';}

        const CUSTOM_PANELS=['es-panel','es-perms-panel','es-vh-panel'];
        const UNLOCKED_TABS={'Permissions':'es-perms-panel','Version History':'es-vh-panel'};

        function getSSP(){return document.querySelector('.container.ssp');}
        function getSidebarCol(){const s=getSSP();return s?s.querySelector('.col-2 .col-12'):null;}
        function getContentArea(){const s=getSSP();return s?s.querySelector('.col-10'):null;}

        function fullCleanup(){ourPanelActive=false;universeId=null;placeIdStr=null;universeConfig={};originalValues={};epsInjected=false;mutating=false;_cachedSelectClass=null;if(sidebarObs){sidebarObs.disconnect();sidebarObs=null;}[...CUSTOM_PANELS,'es-tab'].forEach(id=>document.getElementById(id)?.remove());}

        setInterval(()=>{if(location.pathname!==epsLastPath){epsLastPath=location.pathname;if(isUpdatePage(location.pathname)){const newId=getPlaceId();if(epsInjected&&newId!==placeIdStr)fullCleanup();if(!epsInjected)waitForSSPThenInit();}else fullCleanup();}},200);

        function waitForSSPThenInit(){if(getSSP()&&getSidebarCol()){epsInit();return;}const mo=new MutationObserver(()=>{if(getSSP()&&getSidebarCol()){mo.disconnect();epsInit();}});mo.observe(document.documentElement,{childList:true,subtree:true});const poll=setInterval(()=>{if(!isUpdatePage()){clearInterval(poll);mo.disconnect();return;}if(getSSP()&&getSidebarCol()){clearInterval(poll);mo.disconnect();epsInit();}},300);}

        async function epsInit(){
            if(epsInjected)return;
            placeIdStr=getPlaceId();if(!placeIdStr)return;
            try{const d=await epsApiFetch(`/universes/get-universe-containing-place?placeid=${placeIdStr}`);universeId=d.UniverseId;}catch(e){console.error('[ES]',e);return;}
            try{universeConfig=await epsApiFetch(`/v1/universes/${universeId}/configuration`);}catch(e){console.warn('[ES]',e);}
            waitForSidebar();
        }

        function waitForSidebar(){if(tryInject())return;const mo=new MutationObserver(()=>{if(tryInject())mo.disconnect();});mo.observe(document.body,{childList:true,subtree:true});}

        function tryInject(){
            if(epsInjected)return true;
            const col=getSidebarCol(),content=getContentArea();
            if(!col||!content)return false;
            detectSidebarClasses(col);epsInjected=true;
            attachDelegatedClick(getSSP());unlockDisabledTabs(col);injectSidebarTab(col);injectExtraPanel(content);injectPermissionsPanel(content);injectVersionHistoryPanel(content);startSidebarObserver(col);
            return true;
        }

        function showCustomPanel(panelId){CUSTOM_PANELS.forEach(id=>{const p=document.getElementById(id);if(p)p.style.display=id===panelId?'flex':'none';});hideReactRows(true);}
        function hideCustomPanels(){CUSTOM_PANELS.forEach(id=>{const p=document.getElementById(id);if(p)p.style.display='none';});hideReactRows(false);}
        function hideReactRows(hide){const c=getContentArea();if(!c)return;c.querySelectorAll(':scope > .row, :scope > div').forEach(el=>{if(CUSTOM_PANELS.includes(el.id))return;el.style.display=hide?'none':''});}

        function deselectAllTabs(col){col.querySelectorAll('a').forEach(a=>{scRemove(a,SC.selected);scRemove(a.querySelector('span'),SC.textSelected);});}
        function selectTab(tabEl,col){deselectAllTabs(col);scAdd(tabEl,SC.selected);scAdd(tabEl.querySelector('span'),SC.textSelected);}

        function hookUnlockedTab(a,label,col){scRemove(a,SC.disabled);a.dataset.esUnlocked=label;a.href='#';const fresh=a.cloneNode(true);a.replaceWith(fresh);fresh.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();ourPanelActive=label;pauseObserver(()=>selectTab(fresh,col));showCustomPanel(UNLOCKED_TABS[label]);});}
        function unlockDisabledTabs(col){col.querySelectorAll(`a${scDisabledSel()}`).forEach(a=>{const label=a.querySelector('span')?.textContent?.trim();if(UNLOCKED_TABS[label])hookUnlockedTab(a,label,col);});}
        function reUnlockDisabledTabs(col){col.querySelectorAll('a').forEach(a=>{const label=a.querySelector('span')?.textContent?.trim();if(!UNLOCKED_TABS[label])return;if(scHas(a,SC.disabled)||!a.dataset.esUnlocked)hookUnlockedTab(a,label,col);});}

        function attachDelegatedClick(ssp){if(!ssp)return;ssp.addEventListener('click',e=>{const link=e.target.closest('a');if(!link)return;if(link.id==='es-tab')return;if(link.dataset.esUnlocked)return;if(!getSidebarCol()?.contains(link))return;ourPanelActive=false;hideCustomPanels();pauseObserver(()=>{const col=getSidebarCol();if(!col)return;const esTab=document.getElementById('es-tab');scRemove(esTab,SC.selected);scRemove(esTab?.querySelector('span'),SC.textSelected);col.querySelectorAll('a[data-es-unlocked]').forEach(a=>{scRemove(a,SC.selected);scRemove(a.querySelector('span'),SC.textSelected);});});},true);}

        function startSidebarObserver(col){if(sidebarObs)sidebarObs.disconnect();sidebarObs=new MutationObserver(()=>{if(mutating)return;if(!document.getElementById('es-tab'))pauseObserver(()=>col.appendChild(buildEsTab()));reUnlockDisabledTabs(col);if(ourPanelActive){const activeEl=ourPanelActive==='extra'?document.getElementById('es-tab'):col.querySelector(`a[data-es-unlocked="${ourPanelActive}"]`);if(activeEl&&!scHas(activeEl,SC.selected))pauseObserver(()=>selectTab(activeEl,col));col.querySelectorAll('a:not(#es-tab):not([data-es-unlocked])').forEach(a=>{if(scHas(a,SC.selected))pauseObserver(()=>{scRemove(a,SC.selected);scRemove(a.querySelector('span'),SC.textSelected);});});const panelId=ourPanelActive==='extra'?'es-panel':UNLOCKED_TABS[ourPanelActive];if(panelId)showCustomPanel(panelId);}else{const esTab=document.getElementById('es-tab');if(scHas(esTab,SC.selected))pauseObserver(()=>{scRemove(esTab,SC.selected);scRemove(esTab.querySelector('span'),SC.textSelected);});col.querySelectorAll('a[data-es-unlocked]').forEach(a=>{if(scHas(a,SC.selected))pauseObserver(()=>{scRemove(a,SC.selected);scRemove(a.querySelector('span'),SC.textSelected);});});CUSTOM_PANELS.forEach(id=>{const p=document.getElementById(id);if(p&&p.style.display!=='none')p.style.display='none';}); }});sidebarObs.observe(col,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
        function pauseObserver(fn){if(!sidebarObs){fn();return;}mutating=true;sidebarObs.disconnect();try{fn();}finally{const col=getSidebarCol();if(col)sidebarObs.observe(col,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});mutating=false;}}

        function buildEsTab(){const tab=document.createElement('a');tab.id='es-tab';tab.href='#';tab.className=SC.wrapper||'wrapper-0-2-40';const span=document.createElement('span');span.className=SC.text||'text-0-2-43';span.textContent='Extra Settings';tab.appendChild(span);tab.addEventListener('click',e=>{e.preventDefault();if(!isUpdatePage())return;ourPanelActive='extra';const col=getSidebarCol();if(col)pauseObserver(()=>selectTab(tab,col));showCustomPanel('es-panel');syncSelectClasses();});return tab;}
        function injectSidebarTab(col){if(!document.getElementById('es-tab'))col.appendChild(buildEsTab());}

        function injectExtraPanel(contentArea){
            if(document.getElementById('es-panel'))return;
            const panel=document.createElement('div');panel.id='es-panel';panel.className='row mt-4';panel.style.display='none';
            const inner=document.createElement('div');inner.className='col-6';
            const h=document.createElement('h2');h.className='fw-bolder mb-4';h.textContent='Extra Settings';inner.appendChild(h);
            function deriveVis(cfg){if(cfg.privacyType==='Private')return'Private';if(cfg.isFriendsOnly||cfg.privacyType==='FriendsOnly')return'FriendsOnly';return'Public';}
            inner.appendChild(makeLabel('Game Visibility:'));
            const visSelect=makeSelect([{value:'Public',label:'Public'},{value:'FriendsOnly',label:'Friends Only'},{value:'Private',label:'Private'}],deriveVis(universeConfig));visSelect.id='es-visibility';inner.appendChild(visSelect);
            inner.appendChild(makeLabel('Avatar Type:'));
            const avatarSelect=makeSelect([{value:'PlayerChoice',label:'Player Choice (R6 & R15)'},{value:'MorphToR6',label:'R6 Only'},{value:'MorphToR15',label:'R15 Only'}],universeConfig.universeAvatarType||'PlayerChoice');avatarSelect.id='es-avatar';inner.appendChild(avatarSelect);
            inner.appendChild(makeLabel('Team Create (Cloud Edit):'));
            const tcSelect=makeSelect([{value:'false',label:'Disabled'},{value:'true',label:'Enabled'}],'false');tcSelect.id='es-teamcreate';inner.appendChild(tcSelect);
            const tcPromise=universeId?epsApiFetch(`/v1/universes/${universeId}/teamcreate`).then(d=>{tcSelect.value=String(d.isEnabled??false);}).catch(()=>{}):Promise.resolve();
            tcPromise.then(()=>{originalValues={visibility:visSelect.value,avatarType:avatarSelect.value,teamCreate:tcSelect.value};});
            const btnRow=document.createElement('div');btnRow.className='mt-4';
            const saveBtn=makeBtn('Save','es-save','save',()=>saveExtraSettings({visSelect,avatarSelect,tcSelect}));
            const cancelBtn=makeBtn('Cancel','es-cancel','cancel',()=>{ourPanelActive=false;hideCustomPanels();getSidebarCol()?.querySelector(`a:not(#es-tab):not([data-es-unlocked]):not(.${SC.disabled})`)?.click();});
            btnRow.appendChild(wrapBtn(saveBtn,'save'));btnRow.appendChild(wrapBtn(cancelBtn,'cancel'));inner.appendChild(btnRow);panel.appendChild(inner);contentArea.appendChild(panel);
            new MutationObserver(()=>{if(panel.style.display!=='none')syncSelectClasses();}).observe(panel,{attributes:true,attributeFilter:['style']});
        }

        function injectPermissionsPanel(contentArea){
            if(document.getElementById('es-perms-panel'))return;
            const panel=document.createElement('div');panel.id='es-perms-panel';panel.className='row mt-4';panel.style.display='none';
            const inner=document.createElement('div');inner.className='col-9';
            const h=document.createElement('h2');h.className='fw-bolder mb-4';h.textContent='Permissions';inner.appendChild(h);
            const status=document.createElement('p');status.className='mb-2';status.textContent='Loading…';inner.appendChild(status);
            const widths=['15%','35%','20%','30%'];const{table,tbody}=makeTable(['User ID','Username','Permission',''],widths);inner.appendChild(table);
            const addRow=document.createElement('div');addRow.className='mt-3';addRow.style.cssText='display:flex;gap:8px;align-items:center;';
            const addInput=document.createElement('input');addInput.type='text';addInput.className='w-50';addInput.placeholder='Username to add…';
            const addBtn=makeBtn('Add Editor','es-perms-add-btn','save',async()=>{const u=addInput.value.trim();if(!u){epsToast('Enter a username.',false);return;}await addPermission(u,tbody,status,widths);addInput.value='';});
            addRow.appendChild(addInput);addRow.appendChild(wrapBtn(addBtn,'save'));inner.appendChild(addRow);panel.appendChild(inner);contentArea.appendChild(panel);
            let loaded=false;new MutationObserver(()=>{if(panel.style.display!=='none'){applyLiveClassesToTable(table);if(!loaded){loaded=true;loadPermissions(tbody,status,widths);}}}).observe(panel,{attributes:true,attributeFilter:['style']});
        }

        async function loadPermissions(tbody,status,widths){try{status.textContent='Loading…';const data=await epsApiFetch(`/v2/universes/${universeId}/permissions`);tbody.innerHTML='';const perms=data.data||[];if(!perms.length){status.textContent='No editors added yet.';return;}status.textContent='';perms.forEach(p=>appendPermRow(tbody,p.userId,p.userName,widths));}catch(e){status.textContent='Failed to load.';console.error('[ES]',e);}}
        function appendPermRow(tbody,userId,username,widths){const delBtn=makeBtn('Remove',`es-del-${userId}`,'cancel',async()=>{try{await epsApiFetch(`/v2/universes/${universeId}/permissions_batched`,'DELETE',[{subjectId:userId,subjectType:'User',action:'Edit'}]);tr.remove();epsToast('Removed.',true);}catch(e){console.error('[ES]',e);epsToast('Failed.',false);}});delBtn.style.cssText='font-size:12px;padding:2px 8px;';const tr=makeRow([''+userId,username||'—','Edit',delBtn],widths);tr.dataset.userId=String(userId);tbody.appendChild(tr);}
        async function addPermission(username,tbody,status,widths){try{const r=await epsApiFetch(`/users/get-by-username?username=${encodeURIComponent(username)}`);const userId=r.Id||r.id;if(!userId){epsToast('User not found.',false);return;}if(tbody.querySelector(`tr[data-user-id="${userId}"]`)){epsToast('Already added.',false);return;}await epsApiFetch(`/v2/universes/${universeId}/permissions_batched`,'POST',[{subjectId:userId,subjectType:'User',action:'Edit'}]);appendPermRow(tbody,userId,username,widths);epsToast(`Added ${username}.`,true);}catch(e){console.error('[ES]',e);epsToast('Failed.',false);}}

        function injectVersionHistoryPanel(contentArea){
            if(document.getElementById('es-vh-panel'))return;
            const panel=document.createElement('div');panel.id='es-vh-panel';panel.className='row mt-4';panel.style.display='none';
            const inner=document.createElement('div');inner.className='col-9';
            const h=document.createElement('h2');h.className='fw-bolder mb-4';h.textContent='Version History';inner.appendChild(h);
            const status=document.createElement('p');status.className='mb-2';status.textContent='Loading…';inner.appendChild(status);
            const widths=['10%','30%','35%','25%'];const{table,tbody}=makeTable(['#','Created','Status',''],widths);inner.appendChild(table);
            let nextCursor=null,prevCursor=null;
            const pageRow=document.createElement('div');pageRow.className='mt-2';pageRow.style.cssText='display:flex;gap:8px;';
            const prevBtn=makeBtn('← Prev','es-vh-prev','cancel',async()=>loadVersions(prevCursor));
            const nextBtn=makeBtn('Next →','es-vh-next','save',async()=>loadVersions(nextCursor));
            prevBtn.disabled=true;nextBtn.disabled=true;pageRow.appendChild(wrapBtn(prevBtn,'cancel'));pageRow.appendChild(wrapBtn(nextBtn,'save'));inner.appendChild(pageRow);panel.appendChild(inner);contentArea.appendChild(panel);
            async function loadVersions(cursor){try{status.textContent='Loading…';tbody.innerHTML='';const url=`/apisite/develop/v1/assets/${placeIdStr}/published-versions?limit=10&sortOrder=Desc`+(cursor?`&cursor=${encodeURIComponent(cursor)}`:'');const data=await epsApiFetch(url);const items=data.data||[];prevCursor=data.previousPageCursor||null;nextCursor=data.nextPageCursor||null;prevBtn.disabled=!prevCursor;nextBtn.disabled=!nextCursor;if(!items.length){status.textContent='No versions found.';return;}status.textContent='';const maxVer=Math.max(...items.map(v=>v.assetVersionNumber));const equalVersions=items.filter(v=>v.isEqualToCurrentPublishedVersion).map(v=>v.assetVersionNumber).sort((a,b)=>a-b);const oldestEqual=equalVersions.length>0?equalVersions[0]:null;const hasMultipleEqual=equalVersions.length>1;items.forEach(v=>{const isCurrent=v.assetVersionNumber===maxVer;const isOldestEqual=oldestEqual!==null&&v.assetVersionNumber===oldestEqual;let statusContent;if(isCurrent){if(hasMultipleEqual&&oldestEqual!==maxVer)statusContent={html:`✔ Current <span style="opacity:.6;font-size:11px;">(Same as #${oldestEqual})</span>`};else statusContent='✔ Current';}else if(v.isEqualToCurrentPublishedVersion&&!isOldestEqual){statusContent={html:`<span style="color:#198754;font-size:12px;">● Same as #${oldestEqual}</span>`};}else{statusContent='';}let actionContent;if(!isCurrent){const rb=makeBtn('Revert',`es-revert-${v.assetVersionNumber}`,'cancel',async()=>{rb.disabled=true;rb.textContent='…';try{await epsApiFetch(`/apisite/develop/v1/assets/${placeIdStr}/revert-version?assetVersionNumber=${v.assetVersionNumber}`,'POST');epsToast(`Reverted to v${v.assetVersionNumber}!`,true);await loadVersions(null);}catch(e){console.error('[ES]',e);epsToast('Revert failed.',false);rb.disabled=false;rb.textContent='Revert';}});rb.style.cssText='font-size:12px;padding:2px 8px;';actionContent=rb;}else{actionContent='';}const tr=makeRow([v.assetVersionNumber,new Date(v.created).toLocaleString(),statusContent,actionContent],widths);tbody.appendChild(tr);});}catch(e){status.textContent='Failed to load.';console.error('[ES]',e);}}
            let loaded=false;new MutationObserver(()=>{if(panel.style.display!=='none'){applyLiveClassesToTable(table);if(!loaded){loaded=true;loadVersions(null);}}}).observe(panel,{attributes:true,attributeFilter:['style']});
        }

        async function saveExtraSettings({visSelect,avatarSelect,tcSelect}){
            const cur={visibility:visSelect.value,avatarType:avatarSelect.value,teamCreate:tcSelect.value};
            const vc=cur.visibility!==originalValues.visibility,ac=cur.avatarType!==originalValues.avatarType,tc=cur.teamCreate!==originalValues.teamCreate;
            if(!vc&&!ac&&!tc){epsToast('No changes to save.',true);return;}
            let ok=true;
            if(ac){try{await epsApiFetch(`/v2/universes/${universeId}/configuration`,'PATCH',{universeAvatarType:cur.avatarType});originalValues.avatarType=cur.avatarType;}catch(e){console.error('[ES]',e);ok=false;}}
            if(vc){try{if(cur.visibility==='Private')await epsApiFetch(`/v1/universes/${universeId}/deactivate`,'POST');else if(cur.visibility==='FriendsOnly'){await epsApiFetch(`/v1/universes/${universeId}/activate`,'POST');await epsApiFetch(`/v2/universes/${universeId}/configuration`,'PATCH',{isFriendsOnly:true});}else{await epsApiFetch(`/v1/universes/${universeId}/activate`,'POST');await epsApiFetch(`/v2/universes/${universeId}/configuration`,'PATCH',{isFriendsOnly:false});}originalValues.visibility=cur.visibility;}catch(e){console.error('[ES]',e);ok=false;}}
            if(tc){try{await epsApiFetch(`/v1/universes/${universeId}/teamcreate`,'PATCH',{isEnabled:cur.teamCreate==='true'});originalValues.teamCreate=cur.teamCreate;}catch(e){console.error('[ES]',e);ok=false;}}
            epsToast(ok?'✔ Settings saved!':'⚠ Some settings failed.',ok);
        }

        if(isUpdatePage())waitForSSPThenInit();
    })();


    // ============================================================
    // #5 — Asset Downloader (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(5)) return;
        function extractAssetId(){const url=window.location.href;let m=url.match(/[?&]id=(\d+)/);if(m)return m[1];m=url.match(/\/(library|catalog)\/(\d+)/);if(m)return m[2];return null;}
        function isTargetPage(){return /\/(asset|library|catalog)(\/|\?|$)/.test(window.location.pathname);}
        function getAssetUrl(id,sourceUrl){return sourceUrl.includes('pekora.zip')?`https://www.pekora.zip/library/${id}/-`:`https://create.roblox.com/store/asset/${id}/-`;}
        function getDetailsUrl(id,sourceUrl){return sourceUrl.includes('pekora.zip')?`https://www.pekora.zip/marketplace/productinfo?AssetId=${id}`:`https://economy.roblox.com/v2/assets/${id}/details`;}

        const ASSET_TYPE_NAMES={1:'Image',2:'T-Shirt',3:'Audio',4:'Mesh',5:'Lua',8:'Hat',9:'Place',10:'Model',11:'Shirt',12:'Pants',13:'Decal',17:'Head',18:'Face',19:'Gear',21:'Badge',24:'Animation',34:'Plugin',38:'MeshPart',40:'MeshHiddenSurfaceRemoval',42:'ClothingAccessory',43:'HairAccessory',44:'FaceAccessory',45:'NeckAccessory',46:'ShoulderAccessory',47:'FrontAccessory',48:'BackAccessory',49:'WaistAccessory',62:'Video',77:'DynamicHead'};

        function bytesMatch(bytes,offset,...values){return values.every((v,i)=>bytes[offset+i]===v);}
        function isFileMesh(textPreview){return /^version \d+\.\d{2}\n/.test(textPreview);}
        function detectExtension(arrayBuffer,textPreview){
            const bytes=new Uint8Array(arrayBuffer);
            if(isFileMesh(textPreview))return'.mesh';
            if(/<roblox[\s\S]{0,400}xmlns/i.test(textPreview)){const isPlace=/class="(Workspace|Lighting|Terrain|StarterGui|StarterPack|SoundService|ReplicatedStorage|ServerStorage|ServerScriptService|Players|Teams|Chat|LocalizationService|TestService)"/i.test(textPreview);return isPlace?'.rbxlx':'.rbxmx';}
            if(bytesMatch(bytes,0,0x3C,0x72,0x6F,0x62,0x6C,0x6F,0x78,0x21))return'.rbxm';
            if(bytesMatch(bytes,0,0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A))return'.png';
            if(bytesMatch(bytes,0,0xFF,0xD8,0xFF))return'.jpg';
            if(bytesMatch(bytes,0,0x47,0x49,0x46,0x38))return'.gif';
            if(bytesMatch(bytes,0,0x52,0x49,0x46,0x46)&&bytesMatch(bytes,8,0x57,0x45,0x42,0x50))return'.webp';
            if(bytesMatch(bytes,0,0x42,0x4D))return'.bmp';
            if(bytesMatch(bytes,0,0x52,0x49,0x46,0x46)&&bytesMatch(bytes,8,0x57,0x41,0x56,0x45))return'.wav';
            if(bytesMatch(bytes,0,0x49,0x44,0x33))return'.mp3';
            if(bytes[0]===0xFF&&(bytes[1]===0xFB||bytes[1]===0xF3||bytes[1]===0xF2))return'.mp3';
            if(bytesMatch(bytes,0,0x4F,0x67,0x67,0x53))return'.ogg';
            if(bytesMatch(bytes,0,0x66,0x4C,0x61,0x43))return'.flac';
            if(bytesMatch(bytes,4,0x66,0x74,0x79,0x70)){const brand=String.fromCharCode(bytes[8],bytes[9],bytes[10],bytes[11]);return /M4A /i.test(brand)?'.m4a':'.mp4';}
            if(bytesMatch(bytes,0,0x1A,0x45,0xDF,0xA3))return'.webm';
            if(bytesMatch(bytes,0,0x67,0x6C,0x54,0x46))return'.glb';
            if(/^\s*\{.*"asset"/s.test(textPreview))return'.gltf';
            if(/<COLLADA/i.test(textPreview))return'.dae';
            if(/^(#[^\n]*\n|)(mtllib|usemtl|v |vn |vt |f |g |o )/.test(textPreview))return'.obj';
            if(/^solid\s/i.test(textPreview))return'.stl';
            if(/<svg[\s>]/i.test(textPreview))return'.svg';
            if(/^\s*[\[{]/.test(textPreview))return'.json';
            if(/^\s*<\?xml/i.test(textPreview))return'.xml';
            if(bytesMatch(bytes,0,0x50,0x4B,0x03,0x04))return'.zip';
            return'.bin';
        }

        function getMeshMajorVersion(textPreview){const m=textPreview.match(/^version (\d+)\.\d{2}\n/);return m?parseInt(m[1],10):2;}
        function wrapMeshAsRbxmx(meshBuffer,assetId){
            const textPreview=new TextDecoder().decode(meshBuffer.byteLength<256?meshBuffer:meshBuffer.slice(0,256));
            const majorVersion=getMeshMajorVersion(textPreview),hasSkinnedMesh=majorVersion>=4,meshUrl=`rbxassetid://${assetId}`,refPart=`RBX${assetId}01`,refMesh=`RBX${assetId}02`;
            const xmlHeader=`<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">\n\t<External>null</External>\n\t<External>nil</External>`;
            const xmlFooter=`\n</roblox>`;
            const identityCFrame=(name)=>`\t\t\t<CoordinateFrame name="${name}">\n\t\t\t\t<X>0</X><Y>0</Y><Z>0</Z>\n\t\t\t\t<R00>1</R00><R01>0</R01><R02>0</R02>\n\t\t\t\t<R10>0</R10><R11>1</R11><R12>0</R12>\n\t\t\t\t<R20>0</R20><R21>0</R21><R22>1</R22>\n\t\t\t</CoordinateFrame>`;
            if(majorVersion<=1){return `${xmlHeader}\n\t<Item class="Part" referent="${refPart}">\n\t\t<Properties>\n\t\t\t<bool name="Anchored">true</bool>\n${identityCFrame('CFrame')}\n\t\t\t<string name="Name">MeshPart_${assetId}</string>\n\t\t\t<Item class="SpecialMesh" referent="${refMesh}">\n\t\t\t\t<Properties>\n\t\t\t\t\t<Content name="MeshId"><url>${meshUrl}</url></Content>\n\t\t\t\t</Properties>\n\t\t\t</Item>\n\t\t</Properties>\n\t</Item>${xmlFooter}`;}
            return `${xmlHeader}\n\t<Item class="MeshPart" referent="${refPart}">\n\t\t<Properties>\n\t\t\t<bool name="Anchored">true</bool>\n\t\t\t<bool name="HasSkinnedMesh">${hasSkinnedMesh}</bool>\n${identityCFrame('CFrame')}\n\t\t\t<Content name="MeshID"><url>${meshUrl}</url></Content>\n\t\t\t<Content name="MeshId"><url>${meshUrl}</url></Content>\n\t\t\t<string name="Name">MeshPart_${assetId}</string>\n\t\t\t<int64 name="SourceAssetId">${assetId}</int64>\n\t\t\t<Vector3 name="size"><X>1</X><Y>1</Y><Z>1</Z></Vector3>\n\t\t</Properties>\n\t</Item>${xmlFooter}`;
        }

        function extractRbxmxAssets(xmlText){
            const entries=[],seen=new Set();
            const contentRegex=/<Content\s+name="([^"]*)">\s*<url>([^<]+)<\/url>\s*<\/Content>/gi;
            let match;
            while((match=contentRegex.exec(xmlText))!==null){
                const propName=match[1],url=match[2];
                if(/^rbxasset:\/\//i.test(url))continue;
                let idMatch=url.match(/rbxassetid:\/\/(\d+)/i);
                if(!idMatch)idMatch=url.match(/[?&]id=(\d+)/i);
                if(!idMatch)continue;
                const assetId=idMatch[1],dedupKey=`${propName}:${assetId}`;
                if(seen.has(dedupKey))continue;
                seen.add(dedupKey);
                const nameLower=propName.toLowerCase();
                let category;
                if(nameLower.includes('mesh'))category='MeshId';
                else if(nameLower.includes('texture'))category='TextureId';
                else if(nameLower.includes('sound'))category='SoundId';
                else if(nameLower.includes('animation'))category='AnimationId';
                else category='Other';
                entries.push({category,propName,assetId,sourceUrl:url});
            }
            return entries;
        }
        function isRbxmx(textPreview){return /<roblox[\s\S]{0,400}xmlns/i.test(textPreview);}

        function fetchAssetDetails(id,sourceUrl){return new Promise((resolve)=>{GM_xmlhttpRequest({method:'GET',url:getDetailsUrl(id,sourceUrl),onload:(response)=>{try{resolve(JSON.parse(response.responseText));}catch{resolve(null);}},onerror:()=>resolve(null),ontimeout:()=>resolve(null)});});}
        function formatDate(isoString){if(!isoString)return null;try{return new Date(isoString).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});}catch{return null;}}

        const AD_ICONS={close:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,loader:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pek-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,open:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,mesh:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z"/><path d="M12 12l9-4.5"/><path d="M12 12v9"/><path d="M12 12L3 7.5"/></svg>`,texture:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,sound:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,animation:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>`,other:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,empty:`<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,check:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,error:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>`};
        const CATEGORY_ICONS={MeshId:AD_ICONS.mesh,TextureId:AD_ICONS.texture,SoundId:AD_ICONS.sound,AnimationId:AD_ICONS.animation,Other:AD_ICONS.other};
        const AD_PANEL_ID='pekora-assets-panel';

        function injectPanelStyles(){
            if(document.getElementById('pekora-panel-styles'))return;
            const style=document.createElement('style');style.id='pekora-panel-styles';
            style.textContent=`@keyframes pek-spin{to{transform:rotate(360deg)}}@keyframes pek-fade-in{from{opacity:0;transform:translate(-50%,-50%) scale(0.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}@keyframes pek-overlay-in{from{opacity:0}to{opacity:1}}@keyframes pek-card-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.pek-spin{animation:pek-spin 0.8s linear infinite}#${AD_PANEL_ID}-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:999999;animation:pek-overlay-in 0.15s ease-out}#${AD_PANEL_ID}{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000000;background:#fff;border:1px solid #e4e4e7;border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,0.12),0 4px 12px rgba(0,0,0,0.06);color:#18181b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;font-size:14px;min-width:400px;max-width:540px;max-height:78vh;display:flex;flex-direction:column;overflow:hidden;animation:pek-fade-in 0.2s ease-out}#${AD_PANEL_ID} .panel-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f0f0f2;cursor:move;user-select:none}#${AD_PANEL_ID} .panel-title{font-size:15px;font-weight:600;color:#18181b;margin:0;letter-spacing:-0.01em}#${AD_PANEL_ID} .panel-close{background:none;border:none;color:#a1a1aa;cursor:pointer;padding:4px;line-height:0;border-radius:6px;transition:all 0.15s ease;display:flex;align-items:center;justify-content:center}#${AD_PANEL_ID} .panel-close:hover{background:#f4f4f5;color:#18181b}#${AD_PANEL_ID} .panel-body{padding:12px 20px 20px;overflow-y:auto;flex:1}#${AD_PANEL_ID} .panel-body::-webkit-scrollbar{width:6px}#${AD_PANEL_ID} .panel-body::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:3px}#${AD_PANEL_ID} .panel-loading,#${AD_PANEL_ID} .panel-error,#${AD_PANEL_ID} .panel-empty{text-align:center;padding:32px 16px;display:flex;flex-direction:column;align-items:center;gap:10px}#${AD_PANEL_ID} .panel-loading{color:#71717a;font-size:13px}#${AD_PANEL_ID} .panel-error{color:#ef4444;font-size:13px;font-weight:500}#${AD_PANEL_ID} .panel-empty{color:#a1a1aa;font-size:13px}#${AD_PANEL_ID} .category-label{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#71717a;margin:16px 0 8px 0;text-transform:uppercase;letter-spacing:0.04em}#${AD_PANEL_ID} .category-label:first-child{margin-top:4px}#${AD_PANEL_ID} .category-icon{color:#a1a1aa;display:flex;align-items:center}#${AD_PANEL_ID} .category-count{color:#a1a1aa;font-weight:500;font-size:11px;background:#f4f4f5;padding:1px 6px;border-radius:10px;margin-left:2px}#${AD_PANEL_ID} .asset-card{background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;margin:6px 0;overflow:hidden;transition:all 0.15s ease;animation:pek-card-in 0.25s ease-out both}#${AD_PANEL_ID} .asset-card:hover{border-color:#d4d4d8;box-shadow:0 1px 4px rgba(0,0,0,0.04)}#${AD_PANEL_ID} .asset-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;gap:12px}#${AD_PANEL_ID} .asset-info{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}#${AD_PANEL_ID} .asset-prop{font-size:11px;color:#a1a1aa;font-weight:500;letter-spacing:0.02em}#${AD_PANEL_ID} .asset-id{font-family:'SF Mono','Cascadia Code',Consolas,monospace;font-size:12.5px;font-weight:600;color:#18181b}#${AD_PANEL_ID} .asset-open{background:#18181b;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap;transition:all 0.15s ease;flex-shrink:0;display:inline-flex;align-items:center;gap:5px;font-family:inherit}#${AD_PANEL_ID} .asset-open:hover{background:#27272a}#${AD_PANEL_ID} .asset-details{border-top:1px solid #f0f0f2;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:6px 16px}#${AD_PANEL_ID} .detail-item{display:flex;flex-direction:column;gap:1px;min-width:0}#${AD_PANEL_ID} .detail-item.full-width{grid-column:1/-1}#${AD_PANEL_ID} .detail-key{font-size:10px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:0.04em}#${AD_PANEL_ID} .detail-val{font-size:12.5px;color:#3f3f46;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4}#${AD_PANEL_ID} .detail-val.wrap{white-space:normal;word-break:break-word}#${AD_PANEL_ID} .detail-loading{border-top:1px solid #f0f0f2;padding:10px 12px;display:flex;align-items:center;gap:8px;font-size:12px;color:#a1a1aa}`;
            document.head.appendChild(style);
        }

        function closeAdPanel(){document.getElementById(AD_PANEL_ID)?.remove();document.getElementById(AD_PANEL_ID+'-overlay')?.remove();}

        function createBasePanel(){
            closeAdPanel();injectPanelStyles();
            const overlay=document.createElement('div');overlay.id=AD_PANEL_ID+'-overlay';overlay.addEventListener('click',closeAdPanel);document.body.appendChild(overlay);
            const panel=document.createElement('div');panel.id=AD_PANEL_ID;
            const header=document.createElement('div');header.className='panel-header';
            const title=document.createElement('div');title.className='panel-title';title.textContent='Referenced Assets';
            const closeBtn=document.createElement('button');closeBtn.className='panel-close';closeBtn.innerHTML=AD_ICONS.close;closeBtn.title='Close';closeBtn.addEventListener('click',closeAdPanel);
            header.appendChild(title);header.appendChild(closeBtn);panel.appendChild(header);
            let dragging=false,ox=0,oy=0;
            header.addEventListener('mousedown',(e)=>{if(e.target.closest('.panel-close'))return;dragging=true;const r=panel.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;panel.style.transition='none';});
            document.addEventListener('mousemove',(e)=>{if(!dragging)return;panel.style.left=(e.clientX-ox)+'px';panel.style.top=(e.clientY-oy)+'px';panel.style.transform='none';});
            document.addEventListener('mouseup',()=>{dragging=false;});
            const body=document.createElement('div');body.className='panel-body';panel.appendChild(body);document.body.appendChild(panel);return{panel,body};
        }

        function showLoadingPanel(){const{body}=createBasePanel();const loading=document.createElement('div');loading.className='panel-loading';loading.innerHTML=`${AD_ICONS.loader}<span>Fetching asset data…</span>`;body.appendChild(loading);}
        function showPanelError(message){const panel=document.getElementById(AD_PANEL_ID);if(!panel)return;const body=panel.querySelector('.panel-body');if(!body)return;body.innerHTML='';const err=document.createElement('div');err.className='panel-error';err.textContent=message;body.appendChild(err);}

        function addDetailItem(container,key,val,fullWidth=false,wrap=false){if(!val)return;const item=document.createElement('div');item.className='detail-item'+(fullWidth?' full-width':'');const k=document.createElement('span');k.className='detail-key';k.textContent=key;const v=document.createElement('span');v.className='detail-val'+(wrap?' wrap':'');v.textContent=val;v.title=val;item.appendChild(k);item.appendChild(v);container.appendChild(item);}

        function buildAssetCard(entry,index){
            const card=document.createElement('div');card.className='asset-card';card.style.animationDelay=`${index*0.04}s`;
            const row=document.createElement('div');row.className='asset-row';
            const info=document.createElement('div');info.className='asset-info';
            const prop=document.createElement('span');prop.className='asset-prop';prop.textContent=entry.propName;
            const id=document.createElement('span');id.className='asset-id';id.textContent=entry.assetId;
            info.appendChild(prop);info.appendChild(id);
            const openBtn=document.createElement('button');openBtn.className='asset-open';openBtn.innerHTML=`Open ${AD_ICONS.open}`;openBtn.addEventListener('click',()=>window.open(getAssetUrl(entry.assetId,entry.sourceUrl),'_blank'));
            row.appendChild(info);row.appendChild(openBtn);card.appendChild(row);
            const detailLoading=document.createElement('div');detailLoading.className='detail-loading';detailLoading.innerHTML=`${AD_ICONS.loader} <span>Loading details…</span>`;card.appendChild(detailLoading);
            fetchAssetDetails(entry.assetId,entry.sourceUrl).then(data=>{detailLoading.remove();if(!data)return;const details=document.createElement('div');details.className='asset-details';addDetailItem(details,'Name',data.Name,true,true);if(data.Description&&data.Description.trim())addDetailItem(details,'Description',data.Description,true,true);const typeName=data.AssetTypeId!=null?(ASSET_TYPE_NAMES[data.AssetTypeId]??`Type ${data.AssetTypeId}`):null;addDetailItem(details,'Type',typeName);addDetailItem(details,'Creator',data.Creator?.Name??null);addDetailItem(details,'Created',formatDate(data.Created));addDetailItem(details,'Updated',formatDate(data.Updated));card.appendChild(details);});
            return card;
        }

        function renderAdPanel(entries){
            const{body}=createBasePanel();
            if(!entries||!entries.length){const empty=document.createElement('div');empty.className='panel-empty';empty.innerHTML=`${AD_ICONS.empty}<span>No referenced assets found in this file.</span>`;body.appendChild(empty);return;}
            const categoryOrder=['MeshId','TextureId','SoundId','AnimationId','Other'];
            const categoryNames={MeshId:'Meshes',TextureId:'Textures',SoundId:'Sounds',AnimationId:'Animations',Other:'Other'};
            const groups={};entries.forEach(e=>{if(!groups[e.category])groups[e.category]=[];groups[e.category].push(e);});
            let cardIndex=0;
            categoryOrder.forEach(cat=>{if(!groups[cat]||!groups[cat].length)return;const label=document.createElement('div');label.className='category-label';label.innerHTML=`<span class="category-icon">${CATEGORY_ICONS[cat]||''}</span> ${categoryNames[cat]} <span class="category-count">${groups[cat].length}</span>`;body.appendChild(label);groups[cat].forEach(entry=>{body.appendChild(buildAssetCard(entry,cardIndex++));});});
        }

        function viewAssets(assetId){
            showLoadingPanel();
            GM_xmlhttpRequest({method:'GET',url:`https://www.pekora.zip/asset/?id=${assetId}`,responseType:'arraybuffer',onload:function(response){const buffer=response.response;if(response.status<200||response.status>=300){const bodyText=new TextDecoder().decode(buffer.byteLength<4096?buffer:buffer.slice(0,4096));showPanelError('Server returned '+response.status);return;}if(!buffer||buffer.byteLength===0){showPanelError('Empty response from server');return;}const fullText=new TextDecoder().decode(buffer);if(!isRbxmx(fullText.substring(0,4096))){showPanelError('Asset is not an rbxmx model — no referenced assets to extract.');return;}renderAdPanel(extractRbxmxAssets(fullText));},onerror:()=>showPanelError('Network error or request blocked'),ontimeout:()=>showPanelError('Request timed out')});
        }

        function adShowToast(message,type='error'){document.getElementById('pekora-dl-toast')?.remove();const toast=document.createElement('div');toast.id='pekora-dl-toast';const bg=type==='error'?'#ef4444':'#18181b';toast.style.cssText=`position:fixed;bottom:24px;right:24px;z-index:999999;padding:12px 16px;border-radius:8px;font-size:13px;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#fff;background:${bg};box-shadow:0 8px 24px rgba(0,0,0,0.15);opacity:1;transition:all 0.3s ease;pointer-events:none;max-width:340px;word-break:break-word;display:flex;align-items:center;gap:8px;`;toast.innerHTML=`<span style="display:flex;align-items:center;flex-shrink:0;">${type==='error'?AD_ICONS.error:AD_ICONS.check}</span><span>${message}</span>`;document.body.appendChild(toast);setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translateY(8px)';setTimeout(()=>toast.remove(),300);},4000);}

        let adDlLink=null;
        function setButtonState(text){if(adDlLink)adDlLink.textContent=text;}
        function triggerDownload(blob,filename){const objectUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=objectUrl;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(objectUrl),5000);}

        function downloadAsset(assetId){
            setButtonState('Fetching…');
            GM_xmlhttpRequest({method:'GET',url:`https://www.pekora.zip/asset/?id=${assetId}`,responseType:'arraybuffer',onload:function(response){const buffer=response.response;const bodyText=new TextDecoder().decode(buffer.byteLength<4096?buffer:buffer.slice(0,4096));if(response.status<200||response.status>=300){setButtonState('Download');adShowToast(`Download failed — server returned ${response.status}`,'error');return;}if(!buffer||buffer.byteLength===0){setButtonState('Download');adShowToast('Download failed — empty response','error');return;}const ext=detectExtension(buffer,bodyText);try{let blob,filename;if(ext==='.mesh'){const rbxmx=wrapMeshAsRbxmx(buffer,assetId);blob=new Blob([rbxmx],{type:'text/xml'});filename=`asset_${assetId}.rbxmx`;}else{blob=new Blob([buffer]);filename=`asset_${assetId}${ext}`;}triggerDownload(blob,filename);setButtonState('Download');adShowToast(`Downloaded: ${filename}`,'success');}catch(err){setButtonState('Download');adShowToast(`Download failed — ${err.message}`,'error');}},onerror:()=>{setButtonState('Download');adShowToast('Download failed — network error','error');},ontimeout:()=>{setButtonState('Download');adShowToast('Download failed — request timed out','error');}});
        }

        function injectAdButton(){
            if(!isTargetPage())return;
            const assetId=extractAssetId();if(!assetId)return;
            if(document.getElementById('pekora-dl-li'))return;
            const reportLi=document.querySelector('li[class*="dropdownItem"]');if(!reportLi)return;
            const ul=reportLi.closest('ul');if(!ul)return;
            if(Array.from(ul.querySelectorAll('a')).some(a=>a.textContent.trim().toLowerCase()==='download'))return;
            const liClass=reportLi.className,aClass=reportLi.querySelector('a')?.className??'';
            function createItem(id,text,onClick){const li=document.createElement('li');li.id=id;li.className=liClass;const link=document.createElement('a');link.className=aClass;link.textContent=text;link.href='#';link.addEventListener('click',(e)=>{e.preventDefault();onClick();});li.appendChild(link);return{li,link};}
            const dl=createItem('pekora-dl-li','Download',()=>downloadAsset(assetId));adDlLink=dl.link;ul.appendChild(dl.li);
            const va=createItem('pekora-va-li','View Assets',()=>viewAssets(assetId));ul.appendChild(va.li);
        }

        function adOnNavigate(){['pekora-dl-li','pekora-va-li'].forEach(id=>document.getElementById(id)?.remove());adDlLink=null;closeAdPanel();injectAdButton();}

        function initAd(){
            injectAdButton();
            new MutationObserver(()=>{if(!document.getElementById('pekora-dl-li'))injectAdButton();}).observe(document.body,{childList:true,subtree:true});
            const _push=history.pushState.bind(history),_replace=history.replaceState.bind(history);
            history.pushState=function(...args){_push(...args);adOnNavigate();};
            history.replaceState=function(...args){_replace(...args);adOnNavigate();};
            window.addEventListener('popstate',adOnNavigate);
        }
        if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAd);else initAd();
    })();


    // ============================================================
    // #6 — Avatar Editor Tweaks (x)
    // ============================================================
    (function () {
        if (!extEnabled(6)) return;
        const avatarpage = '/My/Avatar';
        let panel=null, limitedBtn=null, limitedDot=null, allBtn=null, allDot=null;
        let limitedOnly=false, showAll=false, searchText='', loading=false;

        function primaryColor(){const c=getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();return c||'#4b5563';}
        const offColor=primaryColor(), onColor='#22c55e';
        function onAvatar(){return location.pathname===avatarpage;}

        function makeSwitch(text,click){
            const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px;';
            const box=document.createElement('div');box.style.cssText='width:42px;height:22px;border-radius:999px;cursor:pointer;position:relative;transition:background 0.2s ease;';
            const dot=document.createElement('div');dot.style.cssText='width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:left 0.2s ease;';
            box.appendChild(dot);const label=document.createElement('span');label.textContent=text;label.style.cssText='font-size:16px;color:#191919;user-select:none;';box.onclick=click;row.appendChild(box);row.appendChild(label);return{row,box,dot};
        }

        function makeSearch(){
            const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;gap:4px;';
            const input=document.createElement('input');input.type='text';input.placeholder='Search items...';input.style.cssText='padding:6px 8px;border-radius:6px;border:1px solid #ccc;font-size:14px;outline:none;';
            input.addEventListener('input',()=>{searchText=input.value.trim().toLowerCase();applyFilters();});
            wrap.appendChild(input);return wrap;
        }

        function addUI(){
            if(panel)return;
            const target=document.querySelector('[class*="idekbuh"]');if(!target)return;
            panel=document.createElement('div');panel.style.cssText='display:flex;flex-direction:column;gap:10px;margin-top:18px;';
            const limited=makeSwitch('Limiteds Only',()=>{limitedOnly=!limitedOnly;updateLimited();applyFilters();});
            limitedBtn=limited.box;limitedDot=limited.dot;
            const all=makeSwitch('Show All Items',()=>{showAll=!showAll;updateAll();if(showAll)loadEverything();});
            allBtn=all.box;allDot=all.dot;
            panel.appendChild(limited.row);panel.appendChild(all.row);panel.appendChild(makeSearch());target.appendChild(panel);updateLimited();updateAll();
        }

        function removeUI(){loading=false;if(panel){panel.remove();panel=null;limitedBtn=null;limitedDot=null;allBtn=null;allDot=null;}}
        function updateLimited(){if(!limitedBtn)return;if(limitedOnly){limitedBtn.style.background=onColor;limitedDot.style.left='22px';}else{limitedBtn.style.background=offColor;limitedDot.style.left='2px';}}
        function updateAll(){if(!allBtn)return;if(showAll){allBtn.style.background=onColor;allDot.style.left='22px';}else{allBtn.style.background=offColor;allDot.style.left='2px';}}

        function applyFilters(){
            if(!onAvatar())return;
            document.querySelectorAll('[class^="avatarCardWrapper"]').forEach(card=>{
                const restrict=card.querySelector('[class^="restrictionsContainer"]');let name='';
                const img=card.querySelector('img[alt]');if(img&&img.alt)name=img.alt.toLowerCase();else{const el=card.querySelector('[class*="name"],[class*="title"],h3,span');if(el)name=el.textContent.toLowerCase();}
                let show=true;
                if(limitedOnly){const isLimitedItem=restrict&&restrict.children.length>0;if(!isLimitedItem)show=false;}
                if(searchText&&!name.includes(searchText))show=false;
                card.style.display=show?'':'none';
            });
        }

        function loadEverything(){
            if(!onAvatar()||!showAll)return;if(loading)return;
            const btn=document.querySelector('button[class*="loadMoreBtn"]');if(!btn||btn.disabled||btn.offsetParent===null)return;
            loading=true;btn.click();
            setTimeout(()=>{loading=false;applyFilters();if(showAll)loadEverything();},1000);
        }

        new MutationObserver(()=>{if(onAvatar()){addUI();applyFilters();if(showAll)loadEverything();}else removeUI();}).observe(document.body,{childList:true,subtree:true});
    })();


    // ============================================================
    // #7 — Rolify (x)
    // ============================================================
    (function () {
        if (!extEnabled(7)) return;
        var cardselector='.col-6.col-md-4.col-lg-2.mb-2',lift='-3.5px',active=false;
        var valueskey='rolify_values_cache',valuesversionkey='rolify_values_version',valuesdata=null;

        function loadcached(){try{var cached=localStorage.getItem(valueskey);if(cached)valuesdata=JSON.parse(cached);}catch(e){}}
        function savevalues(data,version){localStorage.setItem(valueskey,JSON.stringify(data));localStorage.setItem(valuesversionkey,version);valuesdata=data;}
        function fetchvalues(background){GM_xmlhttpRequest({method:'GET',url:'https://koromons.xyz/api/items',onload:function(res){try{var data=JSON.parse(res.responseText);var items=Array.isArray(data)?data:[];var byId={};items.forEach(function(entry){if(entry&&entry.itemId){byId[String(entry.itemId)]={value:entry.Value||0,demand:(entry.Demand||'').toLowerCase(),trend:(entry.Trend||'').toLowerCase()};}});savevalues(byId,'koromons');document.querySelectorAll(cardselector).forEach(function(card){delete card.dataset.rolifyDone;});requestAnimationFrame(function(){apply();});}catch(e){console.error(e);}}});}
        function getvalue(name){if(!valuesdata||!name)return 0;var key=name.toLowerCase();if(valuesdata[key]&&valuesdata[key].value!=null)return valuesdata[key].value;return 0;}function getvaluebyid(id){if(!valuesdata||!id)return 0;var entry=valuesdata[String(id)];return(entry&&entry.value)?entry.value:0;}function getdemandbyid(id){if(!valuesdata||!id)return null;var entry=valuesdata[String(id)];return(entry&&entry.demand&&entry.demand!=='none')?entry.demand:null;}

        function addcss(){
            if(document.getElementById('rolify-style'))return;
            var style=document.createElement('style');style.id='rolify-style';
            style.textContent=`
                ${cardselector} .card,${cardselector} .card.bg-dark,${cardselector} .card.bg-dark>a>img,${cardselector} .card.bg-dark .card-body,${cardselector} .card.bg-dark .rolify-item-name{border-radius:0!important}
                ${cardselector} .card{transform:scale(1.08);transform-origin:top center;margin-bottom:18px!important;box-shadow:3px 3px 4px rgba(0,0,0,0.4)}
                .bg-dark{background-color:#272b30!important}
                ${cardselector}{transition:transform 0.1s ease}
                ${cardselector}.rolify-hover{transform:translateY(${lift})}
                ${cardselector} .card.bg-dark{background-color:#2b2d35!important;overflow:hidden}
                ${cardselector} .card.bg-dark>a>img{width:100%!important;aspect-ratio:1/0.6;object-fit:contain;background:linear-gradient(#3A3F44,#494E51,#3A3F44);padding:4px}
                ${cardselector} .card.bg-dark .card-body{padding:4px 6px 2px!important;background-color:#30363C!important}
                ${cardselector} .rolify-item-name{display:block;font-size:0.82rem;color:#e9ecef;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:3px 8px;background-color:#30363C}
                .rolify-row{display:flex;justify-content:space-between}
                .rolify-label{font-size:0.72rem;color:#7A8288}
                .rolify-value{font-size:0.8rem;color:#e9ecef}
                .rolify-hide{display:none!important}
                .rolify-value.rolify-serial{color:#f89406!important}
                .rolify-value.rolify-uaid{color:#7A8288!important}
                .rolify-topbar{position:absolute;top:-50px;left:0.5rem;width:98.5%;display:flex;gap:8px;z-index:20}
                .rolify-dropdown{position:relative;min-width:150px}
                .rolify-dropdown-btn{width:100%;padding:8px 10px;background:#3a3f44;color:#e9ecef;border:none;cursor:pointer;text-align:center}
                .rolify-dropdown-btn:hover{background:#282C2F}
                .rolify-dropdown-menu{position:absolute;top:100%;left:0;width:100%;background:#3a3f44;display:none;flex-direction:column;z-index:50}
                .rolify-dropdown.open .rolify-dropdown-menu{display:flex}
                .rolify-dropdown-item{padding:2px 10px;cursor:pointer;color:#7A8288;text-align:center}
                .rolify-dropdown-item:hover{background:#272B30;color:#e9ecef}
                .rolify-search{flex:1;padding:8px 15px;font-size:14px;border:none;outline:none;background:#3a3f44;color:#e9ecef}
            `;
            document.head.appendChild(style);
        }

        function reshape(card){
            if(card.dataset.rolifyDone&&valuesdata)return;card.dataset.rolifyDone='1';
            var body=card.querySelector('.card-body');if(!body)return;
            body.querySelectorAll('.rolify-row').forEach(function(e){e.remove();});card.querySelectorAll('.rolify-item-name').forEach(function(e){e.remove();});
            var cardLink=card.querySelector('a[href]');var cardAssetId=null;if(cardLink){var m=cardLink.getAttribute('href').match(/\/catalog\/(\d+)/);if(m)cardAssetId=m[1];}var ps=body.querySelectorAll('p'),name='',stats=[];
            ps.forEach(function(p){var t=p.textContent.trim();if(p.classList.contains('fw-bolder')){name=t;p.classList.add('rolify-hide');return;}if(t.startsWith('RAP:')){var rap=t.replace('RAP:','').trim();stats.push({l:'RAP',v:rap});stats.push({l:'Value',v:(cardAssetId?getvaluebyid(cardAssetId):getvalue(name)).toLocaleString()});p.classList.add('rolify-hide');return;}if(t.startsWith('Serial:')){var serial=t.replace('Serial:','').trim();if(serial.includes(' of '))serial=serial.split(' of ')[0];stats.push({l:'Serial',v:serial});p.classList.add('rolify-hide');return;}if(t.startsWith('UAID:')){stats.push({l:'UAID',v:t.replace('UAID:','').trim()});p.classList.add('rolify-hide');}});
            var cardel=card.querySelector('.card.bg-dark');if(name&&cardel){var el=document.createElement('span');el.className='rolify-item-name';el.title=name;el.textContent=name;cardel.insertBefore(el,cardel.firstChild);}
            var frag=document.createDocumentFragment();
            stats.forEach(function(s){var row=document.createElement('div');row.className='rolify-row';var l=document.createElement('span');l.className='rolify-label';l.textContent=s.l;var v=document.createElement('span');v.className='rolify-value';v.textContent=s.v;if(s.l==='Serial')v.classList.add('rolify-serial');if(s.l==='UAID')v.classList.add('rolify-uaid');row.appendChild(l);row.appendChild(v);frag.appendChild(row);});
            body.insertBefore(frag,body.firstChild);
        }

        function getcarddata(card){var rows=card.querySelectorAll('.rolify-row'),rap=0,value=0;rows.forEach(function(r){var label=r.querySelector('.rolify-label')?.textContent;var val=r.querySelector('.rolify-value')?.textContent.replace(/,/g,'');if(label==='RAP')rap=parseInt(val)||0;if(label==='Value')value=parseInt(val)||0;});return{rap,value};}
        function sortcards(type,dir){var container=document.querySelector('.col-12.col-lg-9 .row');if(!container)return;var cards=Array.from(container.querySelectorAll(cardselector));cards.sort(function(a,b){var A=getcarddata(a),B=getcarddata(b);return dir==='asc'?A[type]-B[type]:B[type]-A[type];});cards.forEach(function(c){container.appendChild(c);});}
        function filtercards(query){query=query.toLowerCase();document.querySelectorAll(cardselector).forEach(function(card){var nameEl=card.querySelector('.rolify-item-name');if(!nameEl)return;var name=nameEl.textContent.toLowerCase();card.style.display=name.includes(query)?'':'none';});}

        function addsearchbar(){
            if(document.getElementById('rolify-search'))return;
            var container=document.querySelector('.col-12.col-lg-9');if(!container)return;
            var row=container.querySelector('.row');if(!row)return;
            container.style.position='relative';
            var topbar=document.createElement('div');topbar.className='rolify-topbar';
            var dropdown=document.createElement('div');dropdown.className='rolify-dropdown';
            var button=document.createElement('button');button.className='rolify-dropdown-btn';button.textContent='Highest RAP';
            var menu=document.createElement('div');menu.className='rolify-dropdown-menu';
            [{label:'Highest Value',type:'value',dir:'desc'},{label:'Lowest Value',type:'value',dir:'asc'},{label:'Highest RAP',type:'rap',dir:'desc'},{label:'Lowest RAP',type:'rap',dir:'asc'}].forEach(function(opt){var item=document.createElement('div');item.className='rolify-dropdown-item';item.textContent=opt.label;item.addEventListener('click',function(){button.textContent=opt.label;dropdown.classList.remove('open');sortcards(opt.type,opt.dir);});menu.appendChild(item);});
            button.addEventListener('click',function(){dropdown.classList.toggle('open');});dropdown.appendChild(button);dropdown.appendChild(menu);
            var input=document.createElement('input');input.id='rolify-search';input.className='rolify-search';input.placeholder='Search inventory';input.addEventListener('input',function(){filtercards(input.value);});
            topbar.appendChild(dropdown);topbar.appendChild(input);container.appendChild(topbar);
            document.addEventListener('click',function(e){if(!dropdown.contains(e.target))dropdown.classList.remove('open');});
        }

        function apply(root){(root||document).querySelectorAll(cardselector).forEach(function(card){reshape(card);if(card.dataset.rolifyHover)return;card.dataset.rolifyHover='1';card.addEventListener('mouseenter',function(){card.classList.add('rolify-hover');});card.addEventListener('mouseleave',function(){card.classList.remove('rolify-hover');});var input=document.getElementById('rolify-search');if(input&&input.value)filtercards(input.value);});}

        function check(){return location.pathname==='/internal/collectibles'&&location.search.includes('userId=');}

        function runRolify(){
            if(!check()){active=false;return;}if(active)return;active=true;
            addcss();addsearchbar();loadcached();apply();fetchvalues(true);
            var obs=new MutationObserver(function(muts){muts.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)apply(n);});});});
            obs.observe(document.body,{childList:true,subtree:true});
        }

        var ps=history.pushState,rs=history.replaceState;
        history.pushState=function(){ps.apply(this,arguments);setTimeout(runRolify,50);};
        history.replaceState=function(){rs.apply(this,arguments);setTimeout(runRolify,50);};
        window.addEventListener('popstate',function(){setTimeout(runRolify,50);});
        runRolify();
    })();


    // ============================================================
    // #8 — Old Collectibles Page (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(8)) return;
        if (!/\/internal\/collectibles/.test(location.pathname)) return;
        const userId=new URLSearchParams(location.search).get('userId');if(!userId)return;
        const pi=new URLSearchParams(location.search).get('pageIndex');if(pi&&pi!=='0'){location.href=`/internal/collectibles?userId=${userId}`;return;}
        const ocpEsc=t=>{const d=document.createElement('div');d.textContent=t;return d.innerHTML;};

        const fetchAll=async()=>{let items=[],cursor='';do{const r=await new Promise((res,rej)=>GM_xmlhttpRequest({method:'GET',url:`https://www.pekora.zip/apisite/inventory/v1/users/${userId}/assets/collectibles?limit=100${cursor?'&cursor='+cursor:''}`,responseType:'json',onload:r=>res(r),onerror:rej}));const d=typeof r.response==='string'?JSON.parse(r.response):r.response;if(d?.data)items.push(...d.data);cursor=d?.nextPageCursor||'';}while(cursor);return items;};

        const serialColor=num=>{if(!num)return'#555';if(num===1)return'#ffd700';if(num<=5)return'#ff6b6b';if(num<=10)return'#ff922b';if(num<=25)return'#fcc419';if(num<=50)return'#51cf66';if(num<=100)return'#339af0';return'#aaa';};

        const ssCard=i=>{const color=serialColor(i.serialNumber);const id=i.serialNumber?`<span style="color:${color};font-weight:600;">Serial: #${i.serialNumber}</span>`:`<span style="color:#555;">UAID: ${i.userAssetId}</span>`;return `<div style="width:100px;flex-shrink:0;"><img src="/thumbs/asset.ashx?assetId=${i.assetId}" style="width:100px;height:100px;border-radius:4px;display:block;background:#1a1a1a;"><div style="font-size:10px;font-weight:600;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#e0e0e0;">${ocpEsc(i.name)}</div><div style="font-size:9px;color:#888;margin-top:1px;">${(i.recentAveragePrice||0).toLocaleString()} RAP</div><div style="font-size:8px;margin-top:1px;">${id}</div></div>`;};

        const pageCard=i=>`<div class="col-6 col-md-4 col-lg-2 mb-2"><div class="card bg-dark"><a href="/catalog/${i.assetId}/--"><img class="w-100 mx-auto" src="/thumbs/asset.ashx?assetId=${i.assetId}"></a><div class="card-body"><p class="mb-0 fw-bolder text-truncate">${ocpEsc(i.name)}</p><p class="mb-0 text-truncate">RAP: ${(i.recentAveragePrice||0).toLocaleString()}</p><p class="mb-0 text-truncate">${i.serialNumber?`Serial: #${i.serialNumber} of -`:`UAID: ${i.userAssetId}`}</p></div></div></div>`;

        const doScreenshot=async(items,totalRap,username,avatarSrc)=>{
            const wrap=document.createElement('div');wrap.style.cssText='position:fixed;top:-99999px;left:0;z-index:-1;';document.body.appendChild(wrap);
            const c=document.createElement('div');c.style.cssText='width:900px;background:#111;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:24px;';
            const top=document.createElement('div');top.style.cssText='display:flex;align-items:center;gap:14px;margin-bottom:18px;';top.innerHTML=`<img src="${avatarSrc}" style="width:64px;height:64px;border-radius:50%;border:2px solid #333;background:#1a1a1a;"><div style="flex:1;"><div style="font-size:20px;font-weight:700;letter-spacing:-0.3px;">${ocpEsc(username)}</div><div style="font-size:13px;color:#888;margin-top:2px;">${items.length} items · ${totalRap.toLocaleString()} RAP</div></div>`;c.appendChild(top);
            const div1=document.createElement('div');div1.style.cssText='height:1px;background:#222;margin-bottom:16px;';c.appendChild(div1);
            const grid=document.createElement('div');grid.style.cssText='display:flex;flex-wrap:wrap;gap:10px;';grid.innerHTML=items.map(ssCard).join('');c.appendChild(grid);
            const bot=document.createElement('div');bot.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid #222;';bot.innerHTML=`<div style="font-size:10px;color:#444;">pekora.zip</div><div style="font-size:10px;color:#444;">made by @cooper</div>`;c.appendChild(bot);
            wrap.appendChild(c);
            const imgs=c.querySelectorAll('img');await Promise.all([...imgs].map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r;})));await new Promise(r=>setTimeout(r,300));
            try{const canvas=await html2canvas(c,{backgroundColor:'#111',useCORS:true,allowTaint:true,scale:1,logging:false,imageTimeout:10000});canvas.toBlob(blob=>{const a=document.createElement('a');a.download=`${username}_collectibles.png`;a.href=URL.createObjectURL(blob);a.click();URL.revokeObjectURL(a.href);},'image/png');}catch(e){console.error(e);alert('Screenshot failed.');}
            wrap.remove();
        };

        const addUI=(body,items,totalRap)=>{
            const username=body.querySelector('h3')?.textContent?.trim()||userId;
            const avatarSrc=body.querySelector('.col-12.col-lg-3 img')?.src||'';
            const container=body.querySelector('.col-12.col-lg-3');if(!container)return;
            const btn=document.createElement('button');btn.className='btn btn-outline-light btn-sm mt-2';btn.style.cssText='display:block;width:100%;';btn.innerHTML='📸 Screenshot';
            btn.onclick=async()=>{btn.disabled=true;btn.innerHTML='⏳ Capturing...';await doScreenshot(items,totalRap,username,avatarSrc);btn.disabled=false;btn.innerHTML='📸 Screenshot';};
            container.appendChild(btn);
            const credit=document.createElement('a');credit.href='https://www.pekora.zip/users/51543/profile';credit.target='_blank';credit.style.cssText='display:block;text-align:center;font-size:11px;color:#666;margin-top:6px;text-decoration:none;';credit.textContent='made by @cooper';credit.onmouseenter=()=>credit.style.color='#aaa';credit.onmouseleave=()=>credit.style.color='#666';container.appendChild(credit);
        };

        (async()=>{
            const body=document.querySelector('main .card.card-body.bg-dark.text-light');const row=body?.querySelector('.col-12.col-lg-9 .row');if(!body||!row)return;
            row.innerHTML='<div class="col-12 text-center py-4"><div class="spinner-border text-light"></div><p class="mt-2">Loading all collectibles...</p></div>';document.querySelector('main .container.mb-3')?.remove();
            try{const items=(await fetchAll()).sort((a,b)=>(b.recentAveragePrice||0)-(a.recentAveragePrice||0));const totalRap=items.reduce((s,i)=>s+(i.recentAveragePrice||0),0);const rapEl=body.querySelector('.col-12.col-lg-3 p.fw-bolder');if(rapEl)rapEl.textContent=`Total RAP: ${totalRap.toLocaleString()}`;row.innerHTML=items.map(pageCard).join('');addUI(body,items,totalRap);}catch(e){console.error(e);row.innerHTML='<div class="col-12 text-center py-4"><p class="text-danger">Failed to load. Refresh and try again.</p></div>';}
        })();
    })();


    // ============================================================
    // #9 — Better Details (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(9)) return;
        let bdLast='';
        const bdFmt=s=>new Date(s).toLocaleString(undefined,{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'});
        const bdRel=s=>{let d=Math.abs(Date.now()-new Date(s)),f=Date.now()<new Date(s),s2=d/1e3|0,m=s2/60|0,h=m/60|0,dy=h/24|0;return(dy?dy+'d '+h%24+'h':h?h+'h '+m%60+'m':m?m+'m '+s2%60+'s':s2+'s')+(f?' from now':' ago');};
        const bdFind=n=>[...document.querySelectorAll('span[class*="attrLabel"]')].find(e=>e.textContent.trim()===n);
        function bdRun(){
            let id=(location.pathname.match(/\/catalog\/(\d+)/)||[])[1];if(!id)return;
            GM_xmlhttpRequest({method:'POST',url:'https://www.pekora.zip/apisite/catalog/v1/catalog/items/details',headers:{'Content-Type':'application/json'},data:JSON.stringify({items:[{itemType:'Asset',id:+id}]}),onload:r=>{
                let item=JSON.parse(r.responseText)?.data?.[0];if(!item)return;
                let t=0,iv=setInterval(()=>{
                    if(++t>30)return clearInterval(iv);
                    let cl=bdFind('Created');if(!cl)return;
                    let cv=cl.parentElement.querySelector('span[class*="attrVal"]');
                    if(cv&&!cv.dataset.p){cv.dataset.p=1;cv.textContent=bdFmt(item.createdAt);cv.style.cursor='help';cv.onmouseenter=()=>cv.title=bdRel(item.createdAt);}
                    if(!document.querySelector('[data-pu]')){let c=cl.parentElement.cloneNode(true);c.setAttribute('data-pu',1);c.querySelector('span[class*="attrLabel"]').textContent='Updated';let uv=c.querySelector('span[class*="attrVal"]');uv.textContent=bdFmt(item.updatedAt);uv.style.cursor='help';uv.removeAttribute('data-p');uv.onmouseenter=()=>uv.title=bdRel(item.updatedAt);cl.parentElement.after(c);}
                    clearInterval(iv);
                },100);
            }});
        }
        new MutationObserver(()=>{if(location.href!==bdLast){bdLast=location.href;bdRun();}}).observe(document.body,{childList:true,subtree:true});
        bdRun();
    })();


    // ============================================================
    // #10 — Better Profile (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(10)) return;
        GM_addStyle(`
            #last-online-headshot{text-align:center!important;font-size:11px!important;color:#444!important;margin:6px 0 0 0!important;padding:0!important;line-height:1.2!important;display:block!important;visibility:visible!important;opacity:1!important;overflow:visible!important;position:relative!important;z-index:10!important;height:auto!important;max-height:none!important;clip:auto!important}
            #last-online-statistics,#staff-statistics{display:block!important;visibility:visible!important;opacity:1!important}
            h2[class*="username"] #btr-profile-admin-icon{width:28px!important;height:28px!important;background-size:56px auto!important;background-position:-28px -168px!important;display:inline-block!important;vertical-align:middle!important;margin-left:4px!important;margin-right:4px!important;flex-shrink:0!important}
            #staff-statistics .staff-yes{color:#4ade80!important}
        `);

        let bpCurrentUrl='',bpPresenceData=null,bpStaffResult=null;
        let bpInjectedHeadshot=false,bpInjectedStats=false,bpInjectedAdmin=false,bpInjectedStaffStat=false;

        function bpIsProfilePage(){return /\/users\/\d+\/profile/.test(window.location.pathname);}
        function bpGetUserId(){const match=window.location.pathname.match(/\/users\/(\d+)\/profile/);return match?match[1]:null;}

        function bpCleanup(){['last-online-headshot','last-online-statistics','btr-profile-admin-icon','staff-statistics'].forEach(id=>document.getElementById(id)?.remove());bpPresenceData=null;bpStaffResult=null;bpInjectedHeadshot=false;bpInjectedStats=false;bpInjectedAdmin=false;bpInjectedStaffStat=false;}

        function bpFmtLastOnline(dateString){const date=new Date(dateString),diff=Math.floor((Date.now()-date)/1000);let relative;if(diff<60)relative='just now';else if(diff<3600){const m=Math.floor(diff/60);relative=m+' min'+(m!==1?'s':'')+' ago';}else if(diff<86400){const h=Math.floor(diff/3600);relative=h+' hour'+(h!==1?'s':'')+' ago';}else if(diff<2592000){const d=Math.floor(diff/86400);relative=d+' day'+(d!==1?'s':'')+' ago';}else relative=date.toLocaleDateString('en-US');return{relative,absolute:date.toLocaleString('en-US')};}

        function bpFetchData(userId){
            GM_xmlhttpRequest({method:'POST',url:'https://www.pekora.zip/apisite/presence/v1/presence/users',headers:{'Content-Type':'application/json'},data:JSON.stringify({userIds:[userId]}),onload:function(response){try{bpPresenceData=JSON.parse(response.responseText);bpTryInject();}catch(e){}}});
            fetch(`https://www.pekora.zip/Game/LuaWebService/HandleSocialRequest.ashx?method=isingroup&playerid=${userId}&groupid=1200769`,{credentials:'include'}).then(r=>r.text()).then(text=>{bpStaffResult=text.includes('>true<');bpTryInject();}).catch(()=>{bpStaffResult=false;bpTryInject();});
        }

        function bpTryInject(){
            if(!bpIsProfilePage())return;
            if(!bpInjectedHeadshot&&bpPresenceData?.userPresences?.[0]){const thumbs=document.querySelectorAll('[class*="thumbnailContainer"]');for(const thumb of thumbs){if(thumb.querySelector('[class*="avatarHeadshotContainer"]')){if(document.getElementById('last-online-headshot')){bpInjectedHeadshot=true;break;}const{relative,absolute}=bpFmtLastOnline(bpPresenceData.userPresences[0].lastOnline);let parent=thumb;while(parent&&parent!==document.body){parent.style.setProperty('overflow','visible','important');parent=parent.parentElement;}const el=document.createElement('div');el.id='last-online-headshot';el.title=absolute;el.textContent=relative;thumb.appendChild(el);bpInjectedHeadshot=true;break;}}}
            if(!bpInjectedStats&&bpPresenceData?.userPresences?.[0]){const labels=document.querySelectorAll('p');for(const label of labels){if(label.textContent.trim()==='Join Date'){if(document.getElementById('last-online-statistics')){bpInjectedStats=true;break;}const col=label.closest('.col-4');if(!col)break;const{relative,absolute}=bpFmtLastOnline(bpPresenceData.userPresences[0].lastOnline);const newCol=document.createElement('div');newCol.className='col-4';newCol.id='last-online-statistics';const lbl=document.createElement('p');lbl.className=label.className;lbl.textContent='Last Online';const val=document.createElement('p');val.className=col.querySelector('p:last-child').className;val.textContent=absolute;val.title=relative;newCol.appendChild(lbl);newCol.appendChild(val);col.parentElement.appendChild(newCol);bpInjectedStats=true;break;}}}
            if(!bpInjectedAdmin&&bpStaffResult===true){const usernameH2=document.querySelector('h2[class*="username"]');if(usernameH2&&!document.getElementById('btr-profile-admin-icon')){const adminBadge=document.createElement('span');adminBadge.className='icon-administrator';adminBadge.id='btr-profile-admin-icon';adminBadge.title='Pekora Staff';let usernameTextNode=null;for(let node of usernameH2.childNodes){if(node.nodeType===Node.TEXT_NODE&&node.textContent.trim()){usernameTextNode=node;break;}}if(usernameTextNode){usernameTextNode.after(adminBadge);bpInjectedAdmin=true;}else{const verifiedSpan=usernameH2.querySelector('span[class*="icon-verified"]');if(verifiedSpan){verifiedSpan.parentElement.insertBefore(adminBadge,verifiedSpan);bpInjectedAdmin=true;}}}}
            if(!bpInjectedStaffStat&&bpStaffResult!==null){const labels=document.querySelectorAll('p');for(const label of labels){if(label.textContent.trim()==='Join Date'){if(document.getElementById('staff-statistics')){bpInjectedStaffStat=true;break;}const col=label.closest('.col-4');if(!col)break;const newCol=document.createElement('div');newCol.className='col-4';newCol.id='staff-statistics';const lbl=document.createElement('p');lbl.className=label.className;lbl.textContent='Staff';const val=document.createElement('p');val.className=col.querySelector('p:last-child').className+(bpStaffResult?' staff-yes':' staff-no');val.textContent=bpStaffResult?'Yes':'No';newCol.appendChild(lbl);newCol.appendChild(val);col.parentElement.appendChild(newCol);bpInjectedStaffStat=true;break;}}}
        }

        function bpCheckPage(){const newUrl=window.location.href;if(newUrl===bpCurrentUrl)return;bpCurrentUrl=newUrl;bpCleanup();if(bpIsProfilePage()){const userId=bpGetUserId();if(userId)bpFetchData(userId);}}
        bpCheckPage();
        new MutationObserver(()=>{bpCheckPage();if(bpIsProfilePage()&&!(bpInjectedHeadshot&&bpInjectedStats&&bpInjectedAdmin&&bpInjectedStaffStat))bpTryInject();}).observe(document.documentElement,{childList:true,subtree:true});
        window.addEventListener('popstate',bpCheckPage);
        const bpOrigPush=history.pushState; history.pushState=function(){bpOrigPush.apply(this,arguments);bpCheckPage();};
        const bpOrigReplace=history.replaceState; history.replaceState=function(){bpOrigReplace.apply(this,arguments);bpCheckPage();};
    })();


    // ============================================================
    // #11 — API Purchase (pythonplugin)
    // ============================================================
    (function () {
        if (!extEnabled(11)) return;
        let apObserver=null,apRetryTimer=null,apLastUrl=location.href;

        const getItemId=()=>{const m=window.location.pathname.match(/\/catalog\/(\d+)/);return m?m[1]:null;};
        const getApCsrf=()=>{const cookies=document.cookie.split(';');for(let cookie of cookies){const[name,value]=cookie.trim().split('=');if(name.toLowerCase().includes('csrf'))return value;}const meta=document.querySelector('meta[name="csrf-token"]');return meta?meta.getAttribute('content'):null;};
        const getPrice=()=>{const label=document.querySelector('.priceLabel-0-2-61')||document.querySelector('[class*="priceLabel"]');if(!label)return 0;const text=label.textContent.trim();const cleaned=text.replace(/[^\d]/g,'');return cleaned?parseInt(cleaned,10):0;};
        const getSellerId=()=>{const sellerLink=document.querySelector('a[href*="/User.aspx?ID="]');if(sellerLink){const match=sellerLink.href.match(/ID=(\d+)/);if(match)return parseInt(match[1]);}return 1;};

        const apNotify=(msg,ok=true)=>{const toast=document.createElement('div');toast.textContent=msg;toast.style.cssText=`position:fixed;bottom:-60px;right:20px;z-index:9999;background:${ok?'rgba(0,167,107,0.95)':'rgba(195,66,66,0.95)'};backdrop-filter:blur(6px);color:white;padding:12px 18px;border-radius:8px;border:1px solid ${ok?'#009963':'#9b2f2f'};font-family:"Gotham SSm A","Helvetica Neue",Helvetica,Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:0.2px;box-shadow:0 4px 10px rgba(0,0,0,0.25);transition:bottom 0.5s ease,opacity 0.4s ease;opacity:0;text-transform:lowercase;`;document.body.appendChild(toast);setTimeout(()=>{toast.style.bottom='30px';toast.style.opacity='1';},50);setTimeout(()=>{toast.style.bottom='-60px';toast.style.opacity='0';setTimeout(()=>toast.remove(),600);},3500);};

        const purchase=async(id,price=0)=>{const csrf=getApCsrf();try{const res=await fetch(`https://www.pekora.zip/apisite/economy/v1/purchases/products/${id}`,{method:'POST',mode:'same-origin',credentials:'include',headers:{'accept':'application/json, text/plain, */*','content-type':'application/json;charset=UTF-8','x-csrf-token':csrf,'referer':location.href,'origin':'https://www.pekora.zip'},body:JSON.stringify({assetId:parseInt(id),expectedPrice:price,expectedSellerId:getSellerId(),expectedCurrency:1,userAssetId:null})});const text=await res.text();let data={};try{data=JSON.parse(text);}catch{}if(res.ok&&data.purchased){apNotify('purchase successful');setTimeout(()=>location.reload(),1500);}else{apNotify(`failed: ${data.reason||text}`,false);}}catch(err){apNotify(`failed: ${err.message}`,false);}};

        const purchase_button=()=>{const id=getItemId();if(!id)return false;if(document.querySelector('#bypbtn'))return true;const buyButton=document.querySelector('button.newBuyButton-0-2-58')||document.querySelector('button[class*="newBuyButton"]')||document.querySelector('button[class*="buyBtn"]');if(!buyButton||buyButton.disabled||buyButton.textContent.toLowerCase().includes('edit avatar'))return false;const container=buyButton.parentElement;if(!container)return false;const btn=document.createElement('button');btn.id='bypbtn';btn.type='button';btn.textContent='api buy';btn.style.cssText=`background:rgb(0,167,107)!important;color:white!important;margin-top:6px;border:none;border-radius:6px;padding:8px 16px;font-family:"Gotham SSm A","Helvetica Neue",Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;cursor:pointer;width:100%;height:40px;text-transform:uppercase;letter-spacing:0.5px;transition:all 0.25s ease;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);`;btn.onclick=async(e)=>{e.preventDefault();if(btn.disabled)return;btn.disabled=true;btn.textContent='processing...';btn.style.background='#888!important';btn.style.cursor='not-allowed';btn.style.opacity='0.75';try{await purchase(getItemId(),getPrice());}finally{btn.disabled=false;btn.textContent='api buy';btn.style.background='rgb(0,167,107)!important';btn.style.cursor='pointer';btn.style.opacity='1';}};container.appendChild(btn);return true;};

        const start_retry=()=>{if(apRetryTimer){clearTimeout(apRetryTimer);apRetryTimer=null;}let attempts=0;const maxAttempts=20;const retry=()=>{const id=getItemId();if(!id)return;const success=purchase_button();if(success)return;attempts++;if(attempts<maxAttempts)apRetryTimer=setTimeout(retry,300);};retry();};

        const monitor_button=()=>{if(apObserver)apObserver.disconnect();apObserver=new MutationObserver(()=>{const id=getItemId();if(id&&!document.querySelector('#bypbtn'))purchase_button();});apObserver.observe(document.body,{childList:true,subtree:true});};

        const apHandler=()=>{const currentUrl=location.href;if(currentUrl===apLastUrl)return;apLastUrl=currentUrl;setTimeout(()=>start_retry(),100);};
        const apOrigPush=history.pushState; history.pushState=function(...args){apOrigPush.apply(this,args);apHandler();};
        const apOrigReplace=history.replaceState; history.replaceState=function(...args){apOrigReplace.apply(this,args);apHandler();};
        window.addEventListener('popstate',apHandler);

        if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{start_retry();monitor_button();});}else{start_retry();monitor_button();}
    })();


    // ============================================================
    // #12 — Sidebar Buttons+ (r7kano)
    // ============================================================
    (function () {
        if (!extEnabled(12)) return;
        function sbGetUserId(){const profileLink=document.querySelector('a[href*="/users/"][href*="/profile"]');if(!profileLink)return null;const match=profileLink.href.match(/\/users\/(\d+)\//);return match?match[1]:null;}

        const SB_ICONS = {
            'Promocodes': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>',
            '2FA': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l4 1.79V11c0 3.19-2.18 6.17-4 7.08C10.18 17.17 8 14.19 8 11V6.79L12 5zm-1 3v4h2V8h-2zm0 6v2h2v-2h-2z"/></svg>',
            'Tix 2 Robux': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/></svg>',
            'Robux 2 Tix': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>',
            'My Limiteds': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            'TOS': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z"/></svg>',
        };

        function sbInjectButtons(sidebar){
            if(!sidebar)return;if(sidebar.dataset.extraInjected==='true')return;sidebar.dataset.extraInjected='true';
            const homeBtn=[...sidebar.querySelectorAll('a')].find(a=>a.textContent.trim()==='Home');if(!homeBtn)return;
            const userId=sbGetUserId();
            const links=[['Promocodes','/internal/promocodes'],['2FA','/auth/2fa'],['Tix 2 Robux','/internal/tixexchange'],['Robux 2 Tix','/internal/robuxexchange'],['My Limiteds',userId?`/internal/collectibles?userId=${userId}`:'#'],['TOS','/auth/tos']];
            const upgradeBtn=[...sidebar.querySelectorAll('a')].find(a=>a.textContent.includes('Upgrade'));
            links.forEach(([label,url])=>{
                const newBtn=homeBtn.cloneNode(true);newBtn.href=url;
                // Remove existing icon/text
                const existingIcon=newBtn.querySelector('span[class*="icon"],svg');if(existingIcon)existingIcon.remove();
                const textNode=[...newBtn.querySelectorAll('*')].find(el=>el.children.length===0&&el.textContent.trim()!=='');if(textNode)textNode.textContent=label;
                // Inject MDI icon before text
                if(SB_ICONS[label]){
                    const iconSpan=document.createElement('span');
                    iconSpan.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-right:4px;vertical-align:middle;flex-shrink:0;opacity:0.85';
                    iconSpan.innerHTML=SB_ICONS[label];
                    const p=newBtn.querySelector('p,[class*="linkEntry"]');
                    if(p)p.insertBefore(iconSpan,p.firstChild);
                }
                if(upgradeBtn)sidebar.insertBefore(newBtn,upgradeBtn);else sidebar.appendChild(newBtn);
            });
        }

        new MutationObserver(()=>{const sidebar=document.querySelector('div[class*="card"]');if(sidebar)sbInjectButtons(sidebar);}).observe(document.body,{childList:true,subtree:true});
    })();


    // ============================================================
    // #13 — Wardrobe (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(13)) return;
        const BASE             = 'https://www.pekora.zip';
        const API_AVATAR       = `${BASE}/apisite/avatar/v1/avatar`;
        const API_SET_WEARING  = `${BASE}/apisite/avatar/v1/avatar/set-wearing-assets`;
        const API_THUMBS       = `${BASE}/apisite/thumbnails/v1/assets`;
        const API_AUTH         = `${BASE}/apisite/users/v1/users/authenticated`;
    const API_AVATAR_THUMB = `${BASE}/apisite/thumbnails/v1/users/avatar`;
    const AVATAR_PATH      = '/My/Avatar';
    const BODY_TYPES       = new Set(['Torso','LeftArm','RightArm','LeftLeg','RightLeg']);

    let wornIds       = [];
    let assets        = [];
    let thumbs        = {};
    let userId        = null;
    let pollTimer     = null;
    let debounceTimer = null;
    let booted        = false;
    let hooked        = false;
    let panelObserver = null;

    // ── Outfit storage ────────────────────────────────────────────────────────
    const OUTFITS_KEY = 'pek_wardrobe_outfits';
    function getOutfits()      { try { return JSON.parse(localStorage.getItem(OUTFITS_KEY)) || []; } catch { return []; } }
    function saveOutfits(list) { localStorage.setItem(OUTFITS_KEY, JSON.stringify(list)); }

    function saveOutfit(name) {
        if (!name) return false;
        const list    = getOutfits();
        const assetIds = wornIds.filter(id => {
            const a = assets.find(x => x.id === id);
            return a && !BODY_TYPES.has(a.assetType?.name);
        });
        // Snapshot names + thumbnails so the outfit card looks nice even after items leave your inventory
        const snapshot = assetIds.map(id => {
            const a = assets.find(x => x.id === id);
            return { id, name: a?.name ?? '?', thumb: thumbs[id] ?? '' };
        });
        list.push({ name, items: snapshot, saved: Date.now() });
        saveOutfits(list);
        return true;
    }

    function deleteOutfit(idx) {
        const list = getOutfits();
        list.splice(idx, 1);
        saveOutfits(list);
    }

    async function applyOutfit(idx) {
        const list   = getOutfits();
        const outfit = list[idx];
        if (!outfit) return;
        const ids    = outfit.items.map(i => i.id);
        // Keep body parts (head/torso/limbs) from current avatar
        const bodyIds = wornIds.filter(id => {
            const a = assets.find(x => x.id === id);
            return a && BODY_TYPES.has(a.assetType?.name);
        });
        const next = [...new Set([...bodyIds, ...ids])];
        try {
            await post(API_SET_WEARING, { assetIds: next });
            wornIds = next;
            // Merge any outfit items into our local asset cache (for thumbnail display)
            for (const item of outfit.items) {
                if (!assets.find(x => x.id === item.id))
                    assets.push({ id: item.id, name: item.name, assetType: { name: 'Hat' } });
                if (item.thumb && !thumbs[item.id]) thumbs[item.id] = item.thumb;
            }
            toast(`Loaded "${outfit.name}"`, 'ok');
            renderGrid();
            refreshAvatarThumb();
        } catch {
            toast('Failed to apply outfit', 'err');
        }
    }

    // ── Styles ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('pek-styles')) return;
        const s = document.createElement('style');
        s.id = 'pek-styles';
        s.textContent = `
            #pek-panel {
                margin-top: 10px;
                padding: 10px;
                box-sizing: border-box;
                font-family: inherit;
                background: var(--section-background, rgba(255,255,255,0.03));
                border-radius: 10px;
            }
            #pek-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            #pek-title {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                color: var(--text-color-secondary, #aaa);
            }
            #pek-count {
                font-size: 10px;
                font-weight: 600;
                background: rgba(79,142,247,0.18);
                color: #4f8ef7;
                border-radius: 20px;
                padding: 1px 8px;
            }
            #pek-search-wrap {
                position: relative;
                margin-bottom: 7px;
            }
            #pek-search-wrap svg {
                position: absolute;
                left: 7px;
                top: 50%;
                transform: translateY(-50%);
                width: 11px;
                height: 11px;
                stroke: var(--text-color-secondary, #888);
                fill: none;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                pointer-events: none;
            }
            #pek-search {
                width: 100%;
                box-sizing: border-box;
                padding: 5px 7px 5px 24px;
                font-size: 10px;
                font-family: inherit;
                color: var(--text-color, #ddd);
                background: var(--input-background, rgba(255,255,255,0.07));
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 6px;
                outline: none;
                transition: border-color 0.15s;
            }
            #pek-search::placeholder { color: var(--text-color-secondary, #777); }
            #pek-search:focus { border-color: rgba(79,142,247,0.6); }
            #pek-scroll {
                max-height: 220px;
                overflow-y: auto;
                overflow-x: hidden;
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.15) transparent;
                padding: 2px;
                margin: -2px;
            }
            #pek-scroll::-webkit-scrollbar { width: 4px; }
            #pek-scroll::-webkit-scrollbar-track { background: transparent; }
            #pek-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
            #pek-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 5px;
            }
            .pek-card {
                position: relative;
                border-radius: 7px;
                overflow: hidden;
                cursor: pointer;
                outline: 2px solid transparent;
                outline-offset: -2px;
                transition: outline-color 0.15s, opacity 0.15s, transform 0.12s;
                background: var(--card-background, #2a2a2a);
                user-select: none;
            }
            .pek-card:hover { transform: scale(1.05); opacity: 1 !important; z-index: 1; }
            .pek-card:active { transform: scale(0.96); }
            .pek-card.worn { outline-color: #4f8ef7; }
            .pek-card:not(.worn) { opacity: 0.4; }
            .pek-card.busy { pointer-events: none; opacity: 0.55 !important; }
            .pek-card.busy::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
            .pek-card img { width: 100%; aspect-ratio: 1; display: block; object-fit: cover; pointer-events: none; }
            .pek-card-badge {
                position: absolute;
                top: 3px; right: 3px;
                width: 13px; height: 13px;
                background: #4f8ef7;
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                box-shadow: 0 1px 4px rgba(0,0,0,0.5);
                pointer-events: none;
            }
            .pek-card.worn .pek-card-badge { display: flex; }
            .pek-card-badge svg { width: 7px; height: 7px; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
            .pek-card-label { font-size: 8px; color: var(--text-color, #ddd); padding: 3px 4px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; pointer-events: none; }
            #pek-toast { font-size: 10px; font-weight: 500; margin-top: 7px; min-height: 14px; transition: opacity 0.25s; }
            #pek-toast.ok   { color: #52c97a; opacity: 1; }
            #pek-toast.err  { color: #e05252; opacity: 1; }
            #pek-toast.fade { opacity: 0; }
            #pek-empty { font-size: 10px; color: var(--text-color-secondary, #777); padding: 8px 0 4px; text-align: center; }
            .pek-avatar-loading { opacity: 0.4; transition: opacity 0.25s; }

            /* ── Wardrobe / saved outfits ── */
            #pek-divider {
                height: 1px;
                background: rgba(255,255,255,0.08);
                margin: 10px 0 8px;
            }
            #pek-wardrobe-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 7px;
            }
            #pek-wardrobe-title {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                color: var(--text-color-secondary, #aaa);
            }
            #pek-save-btn {
                font-size: 9px;
                font-weight: 600;
                padding: 3px 8px;
                border-radius: 5px;
                border: 1px solid rgba(79,142,247,0.45);
                background: rgba(79,142,247,0.12);
                color: #4f8ef7;
                cursor: pointer;
                font-family: inherit;
                transition: background 0.15s;
                white-space: nowrap;
            }
            #pek-save-btn:hover { background: rgba(79,142,247,0.22); }
            #pek-save-form {
                display: none;
                gap: 5px;
                margin-bottom: 7px;
            }
            #pek-save-form.open { display: flex; }
            #pek-save-input {
                flex: 1;
                padding: 4px 7px;
                font-size: 10px;
                font-family: inherit;
                color: var(--text-color, #ddd);
                background: var(--input-background, rgba(255,255,255,0.07));
                border: 1px solid rgba(255,255,255,0.12);
                border-radius: 5px;
                outline: none;
                transition: border-color 0.15s;
            }
            #pek-save-input:focus { border-color: rgba(79,142,247,0.6); }
            #pek-save-input::placeholder { color: var(--text-color-secondary, #666); }
            #pek-save-confirm {
                font-size: 9px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 5px;
                border: 1px solid rgba(82,201,122,0.4);
                background: rgba(82,201,122,0.12);
                color: #52c97a;
                cursor: pointer;
                font-family: inherit;
                white-space: nowrap;
                transition: background 0.15s;
            }
            #pek-save-confirm:hover { background: rgba(82,201,122,0.22); }
            #pek-outfits-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
                max-height: 180px;
                overflow-y: auto;
                overflow-x: hidden;
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.1) transparent;
            }
            #pek-outfits-list::-webkit-scrollbar { width: 3px; }
            #pek-outfits-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
            .pek-outfit-row {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 5px 6px;
                border-radius: 7px;
                background: var(--card-background, rgba(255,255,255,0.04));
                border: 1px solid rgba(255,255,255,0.06);
                transition: border-color 0.15s;
            }
            .pek-outfit-row:hover { border-color: rgba(255,255,255,0.14); }
            .pek-outfit-thumbs {
                display: flex;
                gap: 2px;
                flex-shrink: 0;
            }
            .pek-outfit-thumb {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                object-fit: cover;
                background: rgba(255,255,255,0.06);
            }
            .pek-outfit-info {
                flex: 1;
                min-width: 0;
            }
            .pek-outfit-name {
                font-size: 10px;
                font-weight: 600;
                color: var(--text-color, #ddd);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .pek-outfit-meta {
                font-size: 8px;
                color: var(--text-color-secondary, #666);
                margin-top: 1px;
            }
            .pek-outfit-load {
                font-size: 8px;
                font-weight: 600;
                padding: 3px 7px;
                border-radius: 4px;
                border: 1px solid rgba(79,142,247,0.35);
                background: rgba(79,142,247,0.1);
                color: #4f8ef7;
                cursor: pointer;
                font-family: inherit;
                flex-shrink: 0;
                transition: background 0.15s;
            }
            .pek-outfit-load:hover { background: rgba(79,142,247,0.22); }
            .pek-outfit-del {
                font-size: 10px;
                font-weight: 700;
                width: 18px;
                height: 18px;
                border-radius: 4px;
                border: 1px solid rgba(224,82,82,0.3);
                background: transparent;
                color: #e05252;
                cursor: pointer;
                font-family: inherit;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.15s;
                line-height: 1;
                padding: 0;
            }
            .pek-outfit-del:hover { background: rgba(224,82,82,0.15); }
            #pek-outfits-empty {
                font-size: 10px;
                color: var(--text-color-secondary, #666);
                text-align: center;
                padding: 10px 0 4px;
            }
        `;
        (document.head || document.documentElement).appendChild(s);
    }

    // ── Network ───────────────────────────────────────────────────────────────

    // Read CSRF token from cookies (pekora uses rbxcsrf4)
    function getCsrf() {
        const m = document.cookie.match(/(?:^|;\s*)(?:rbxcsrf4|_csrf|csrf)=([^;]+)/i);
        return m ? decodeURIComponent(m[1]) : '';
    }

    function get(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET', url, withCredentials: true,
                onload:  r => { try { resolve(JSON.parse(r.responseText)); } catch (e) { reject(e); } },
                onerror: reject,
            });
        });
    }

    // POST with CSRF — on a 403 we grab the token from the response header and retry once
    function post(url, body) {
        const csrf = getCsrf();
        return new Promise((resolve, reject) => {
            const doRequest = (csrfToken) => {
                GM_xmlhttpRequest({
                    method: 'POST', url,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
                    },
                    data: JSON.stringify(body),
                    withCredentials: true,
                    onload: r => {
                        // If 403 and no token yet, grab from header and retry once
                        if (r.status === 403 && !csrfToken) {
                            const fresh = r.responseHeaders?.match(/x-csrf-token:\s*([^\r\n]+)/i)?.[1]?.trim();
                            if (fresh) { doRequest(fresh); return; }
                        }
                        if (r.status === 403) { reject(new Error('CSRF/auth failed (403)')); return; }
                        try { resolve(JSON.parse(r.responseText)); } catch { resolve({}); }
                    },
                    onerror: reject,
                });
            };
            doRequest(csrf);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    const isAvatarPage = () => location.pathname.startsWith(AVATAR_PATH);
    const getThumb     = () => document.querySelector('[class*="avatarThumbContainer"]');
    const getAvatarImg = () => getThumb()?.querySelector('img') ?? null;

    function toast(msg, type) {
        const el = document.getElementById('pek-toast');
        if (!el) return;
        el.textContent = msg;
        el.className   = type;
        clearTimeout(el._t);
        el._t = setTimeout(() => { el.className = 'fade'; }, 2000);
    }

    // ── Avatar thumbnail refresh ──────────────────────────────────────────────

    function refreshAvatarThumb() {
        if (!userId) return;
        clearTimeout(pollTimer);
        getAvatarImg()?.classList.add('pek-avatar-loading');
        let n = 0;
        const poll = async () => {
            if (!isAvatarPage()) return;
            n++;
            try {
                const data  = await get(`${API_AVATAR_THUMB}?userIds=${userId}&size=420x420&format=png`);
                const entry = data?.data?.[0];
                if (entry?.state === 'Completed' && entry.imageUrl) {
                    const img = getAvatarImg();
                    if (img) {
                        img.src = '';
                        requestAnimationFrame(() => {
                            img.src = `${BASE}${entry.imageUrl}`;
                            img.classList.remove('pek-avatar-loading');
                        });
                    }
                    return;
                }
            } catch {}
            if (n < 15) pollTimer = setTimeout(poll, 600);
            else getAvatarImg()?.classList.remove('pek-avatar-loading');
        };
        poll(); // start immediately, no initial delay
    }

    // ── Data ──────────────────────────────────────────────────────────────────

    async function fetchAvatar() {
        const data = await get(API_AVATAR);
        const list = data.assets || [];
        wornIds = list.map(a => a.id);

        for (const a of list)
            if (!assets.find(x => x.id === a.id)) assets.push(a);

        // Scrape thumbnails already visible in the DOM (free, instant)
        document.querySelectorAll('[class*="avatarCardContainer"]').forEach(card => {
            const link = card.querySelector('a[href*="/catalog/"]');
            const img  = card.querySelector('[class*="avatarCardImage"] img');
            if (!link || !img) return;
            const m = link.href.match(/\/catalog\/(\d+)\//);
            if (m) { const id = +m[1]; if (!thumbs[id]) thumbs[id] = img.src.replace(BASE, ''); }
        });

        // Fetch any missing thumbnails, then render once everything is ready
        const missing = list.filter(a => !BODY_TYPES.has(a.assetType?.name) && !thumbs[a.id]).map(a => a.id);
        if (missing.length) {
            try {
                const td = await get(`${API_THUMBS}?assetIds=${missing.join('%2C')}&format=png&size=110x110`);
                for (const t of (td.data || []))
                    if (t.state === 'Completed') thumbs[t.targetId] = t.imageUrl;
            } catch {}
        }
        renderGrid();
    }

    // ── UI ────────────────────────────────────────────────────────────────────

    function thumbSrc(id) {
        const v = thumbs[id];
        return v ? (v.startsWith('http') ? v : BASE + v) : '';
    }

    function renderGrid() {
        const grid  = document.getElementById('pek-grid');
        const count = document.getElementById('pek-count');
        const empty = document.getElementById('pek-empty');
        if (!grid) return;

        const q    = (document.getElementById('pek-search')?.value ?? '').toLowerCase().trim();
        const worn = assets.filter(a =>
            !BODY_TYPES.has(a.assetType?.name) && wornIds.includes(a.id) &&
            (!q || a.name.toLowerCase().includes(q))
        );

        grid.innerHTML = '';
        worn.forEach(a => {
            const card = document.createElement('div');
            card.className  = 'pek-card worn';
            card.title      = `${a.name} (${a.assetType?.name ?? ''})`;
            card.dataset.id = String(a.id);
            card.innerHTML  = `
                <span class="pek-card-badge"><svg viewBox="0 0 10 10"><polyline points="2,5 4,7.5 8,3"/></svg></span>
                <img src="${thumbSrc(a.id)}" alt="" loading="eager" decoding="async">
                <div class="pek-card-label">${a.name}</div>
            `;
            card.addEventListener('click', () => toggleItem(a.id, card));
            grid.appendChild(card);
        });

        const total = assets.filter(a => !BODY_TYPES.has(a.assetType?.name) && wornIds.includes(a.id)).length;
        if (empty) empty.style.display = worn.length ? 'none' : '';
        if (count) count.textContent   = total;
    }

    // ── Toggle ────────────────────────────────────────────────────────────────

    async function toggleItem(assetId, card) {
        if (card.classList.contains('busy')) return;
        const removing = wornIds.includes(assetId);
        const next     = removing ? wornIds.filter(id => id !== assetId) : [...wornIds, assetId];

        card.classList.add('busy');
        card.classList.toggle('worn', !removing);

        try {
            const res = await post(API_SET_WEARING, { assetIds: next });
            if (res && res.errors && res.errors.length) throw new Error(res.errors[0].message || 'API error');
            wornIds = next;
            toast(removing ? 'Removed' : 'Equipped', 'ok');
            renderGrid();
            refreshAvatarThumb();
        } catch (err) {
            card.classList.toggle('worn', removing);
            card.classList.remove('busy');
            toast(err?.message || 'Something went wrong', 'err');
        }
    }

    // ── Outfit list renderer ─────────────────────────────────────────────────

    function renderOutfits() {
        const list  = document.getElementById('pek-outfits-list');
        const empty = document.getElementById('pek-outfits-empty');
        if (!list) return;
        const outfits = getOutfits();
        list.innerHTML = '';
        if (!outfits.length) {
            if (empty) empty.style.display = '';
            return;
        }
        if (empty) empty.style.display = 'none';

        outfits.forEach((outfit, idx) => {
            const row   = document.createElement('div');
            row.className = 'pek-outfit-row';

            // Tiny thumbnail strip (up to 3 items)
            const thumbsEl = document.createElement('div');
            thumbsEl.className = 'pek-outfit-thumbs';
            outfit.items.slice(0, 3).forEach(item => {
                const img = document.createElement('img');
                img.className = 'pek-outfit-thumb';
                img.alt       = item.name;
                const src = item.thumb || thumbs[item.id] || '';
                img.src = src.startsWith('http') ? src : (src ? BASE + src : '');
                thumbsEl.appendChild(img);
            });

            // Info
            const info = document.createElement('div');
            info.className = 'pek-outfit-info';
            const name  = document.createElement('div');
            name.className = 'pek-outfit-name';
            name.textContent = outfit.name;
            name.title       = outfit.name;
            const meta  = document.createElement('div');
            meta.className = 'pek-outfit-meta';
            meta.textContent = `${outfit.items.length} item${outfit.items.length !== 1 ? 's' : ''}`;
            info.appendChild(name);
            info.appendChild(meta);

            // Load button
            const loadBtn = document.createElement('button');
            loadBtn.className   = 'pek-outfit-load';
            loadBtn.textContent = 'Wear';
            loadBtn.addEventListener('click', async () => {
                loadBtn.textContent = '…';
                loadBtn.style.pointerEvents = 'none';
                await applyOutfit(idx);
                loadBtn.textContent = 'Wear';
                loadBtn.style.pointerEvents = '';
            });

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className   = 'pek-outfit-del';
            delBtn.textContent = '×';
            delBtn.title       = 'Delete outfit';
            delBtn.addEventListener('click', () => {
                deleteOutfit(idx);
                renderOutfits();
            });

            row.appendChild(thumbsEl);
            row.appendChild(info);
            row.appendChild(loadBtn);
            row.appendChild(delBtn);
            list.appendChild(row);
        });
    }

    // ── Panel ─────────────────────────────────────────────────────────────────

    function injectPanel() {
        document.getElementById('pek-panel')?.remove();
        const thumb = getThumb();
        if (!thumb) return;

        const panel = document.createElement('div');
        panel.id = 'pek-panel';
        panel.innerHTML = `
            <div id="pek-header">
                <span id="pek-title">Wearing</span>
                <span id="pek-count">0</span>
            </div>
            <div id="pek-search-wrap">
                <svg viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
                <input id="pek-search" type="text" placeholder="Search…" autocomplete="off" spellcheck="false">
            </div>
            <div id="pek-scroll">
                <div id="pek-grid"></div>
                <div id="pek-empty" style="display:none">Nothing equipped</div>
            </div>
            <div id="pek-toast" class="fade"></div>
            <div id="pek-divider"></div>
            <div id="pek-wardrobe-header">
                <span id="pek-wardrobe-title">Wardrobe</span>
                <button id="pek-save-btn">+ Save outfit</button>
            </div>
            <div id="pek-save-form">
                <input id="pek-save-input" type="text" placeholder="Outfit name…" maxlength="40" autocomplete="off" spellcheck="false">
                <button id="pek-save-confirm">Save</button>
            </div>
            <div id="pek-outfits-list"></div>
            <div id="pek-outfits-empty">No saved outfits</div>
        `;
        panel.querySelector('#pek-search').addEventListener('input', renderGrid);

        // ── Wardrobe save form wiring ─────────────────────────────────────────
        const saveBtn     = panel.querySelector('#pek-save-btn');
        const saveForm    = panel.querySelector('#pek-save-form');
        const saveInput   = panel.querySelector('#pek-save-input');
        const saveConfirm = panel.querySelector('#pek-save-confirm');

        saveBtn.addEventListener('click', () => {
            saveForm.classList.toggle('open');
            if (saveForm.classList.contains('open')) saveInput.focus();
            else saveInput.value = '';
        });

        const doSave = () => {
            const name = saveInput.value.trim();
            if (!name) { toast('Enter a name', 'err'); return; }
            if (saveOutfit(name)) {
                toast(`Saved "${name}"`, 'ok');
                saveInput.value = '';
                saveForm.classList.remove('open');
                renderOutfits();
            }
        };
        saveConfirm.addEventListener('click', doSave);
        saveInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSave(); });

        renderOutfits();

        const parent = thumb.parentNode;

        // Disconnect before mutating so our own insertBefore doesn't re-trigger
        panelObserver?.disconnect();
        parent.insertBefore(panel, thumb.nextSibling);

        // Match panel width to the thumb container. If it hasn't painted yet,
        // a ResizeObserver fires once it gets a real size.
        const syncWidth = () => {
            const w = thumb.offsetWidth;
            if (w > 0) { panel.style.width = w + 'px'; panel.style.maxWidth = w + 'px'; }
        };
        syncWidth();
        if (!thumb.offsetWidth) {
            const ro = new ResizeObserver(() => { syncWidth(); ro.disconnect(); });
            ro.observe(thumb);
        }

        renderGrid();

        // Watch for React removing our panel, then silently re-insert it.
        // Uses a re-entrancy flag so the insertBefore inside doesn't loop.
        let reinserting = false;
        panelObserver = new MutationObserver(() => {
            if (reinserting || document.getElementById('pek-panel')) return;
            reinserting = true;
            panelObserver.disconnect();
            const t = getThumb();
            if (t) t.parentNode.insertBefore(panel, t.nextSibling);
            panelObserver.observe(parent, { childList: true });
            reinserting = false;
        });
        panelObserver.observe(parent, { childList: true });
    }

    // ── Native card hook ──────────────────────────────────────────────────────

    function hookNativeCards() {
        if (hooked) return;
        const container = document.querySelector('[class*="itemContainer"]');
        if (!container) return;
        hooked = true;
        container.addEventListener('click', e => {
            if (!e.target.closest('[class*="avatarCardContainer"]')) return;
            if (e.target.closest('a[href*="/catalog/"]')) return;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                if (!isAvatarPage()) return;
                try { await fetchAvatar(); renderGrid(); refreshAvatarThumb(); } catch {}
            }, 100);
        }, true);
    }

    // ── Request interception ──────────────────────────────────────────────────

    function interceptRequests() {
        const origOpen = XMLHttpRequest.prototype.open;
        const origSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
            this._pekUrl = url; this._pekMethod = method;
            return origOpen.call(this, method, url, ...rest);
        };
        XMLHttpRequest.prototype.send = function (body) {
            if (this._pekMethod === 'POST' && this._pekUrl?.includes('set-wearing-assets'))
                this.addEventListener('load', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(async () => {
                        try { await fetchAvatar(); renderGrid(); refreshAvatarThumb(); } catch {}
                    }, 100);
                });
            return origSend.call(this, body);
        };
        const origFetch = window.fetch;
        window.fetch = function (input, init) {
            const url = typeof input === 'string' ? input : input?.url ?? '';
            const p   = origFetch.apply(this, arguments);
            if (init?.method?.toUpperCase() === 'POST' && url.includes('set-wearing-assets'))
                p.then(() => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(async () => {
                        try { await fetchAvatar(); renderGrid(); refreshAvatarThumb(); } catch {}
                    }, 100);
                });
            return p;
        };
    }

    // ── Boot / teardown ───────────────────────────────────────────────────────

    function teardown() {
        clearTimeout(pollTimer);
        clearTimeout(debounceTimer);
        panelObserver?.disconnect();
        panelObserver = null;
        document.getElementById('pek-panel')?.remove();
        booted = false;
        hooked = false;
    }

    async function boot() {
        if (booted) return;
        booted = true;
        injectStyles();

        // Wait for thumb container, then inject panel immediately (empty state)
        // while data loads in parallel — feels instant
        const thumb = await waitFor(getThumb);
        if (!thumb || !isAvatarPage()) { booted = false; return; }

        injectPanel();
        hookNativeCards();

        // Load data and populate
        try {
            if (!userId) {
                const [auth] = await Promise.all([get(API_AUTH), fetchAvatar()]);
                userId = auth.id;
            } else {
                await fetchAvatar();
            }
            renderGrid();
        } catch {
            booted = false;
            return;
        }

        // If panel somehow disappeared after boot (React wiped it), re-inject once
        if (!document.getElementById('pek-panel')) injectPanel();
    }

    function waitFor(fn) {
        return new Promise(resolve => {
            const el = fn();
            if (el) return resolve(el);
            const mo = new MutationObserver(() => {
                const el = fn();
                if (el) { mo.disconnect(); resolve(el); }
            });
            mo.observe(document.documentElement, { childList: true, subtree: true });
            // bail if we navigate away
            const iv = setInterval(() => { if (!isAvatarPage()) { mo.disconnect(); clearInterval(iv); resolve(null); } }, 200);
        });
    }

    // ── SPA navigation ────────────────────────────────────────────────────────

    let lastHref = location.href;
    function onNavigate() {
        const href = location.href;
        if (href === lastHref) {
            // Same URL — but if we're on avatar page and panel is gone, re-inject
            if (isAvatarPage() && booted && !document.getElementById('pek-panel')) injectPanel();
            return;
        }
        lastHref = href;
        isAvatarPage() ? boot() : teardown();
    }

    const _push = history.pushState, _replace = history.replaceState;
    history.pushState    = function () { _push.apply(this, arguments);    onNavigate(); };
    history.replaceState = function () { _replace.apply(this, arguments); onNavigate(); };
    window.addEventListener('popstate', onNavigate);
    setInterval(onNavigate, 500);

    interceptRequests();
    if (isAvatarPage()) boot();

    })();  // end #13 Wardrobe



    // ============================================================
    // #14 — Catalog Item Value + Profile Value
    // 1:1 from koromons-trading-extensions.js (runCatalogInjector + runProfileInjector)
    // ============================================================
    (function () {
        if (!extEnabled(14)) return;

        const API_URL_14 = "https://www.koromons.xyz/api/items";
        let ITEMS_14 = [];
        let FETCHED_14 = false;

        async function loadKoromons14() {
            if (FETCHED_14) return ITEMS_14;
            FETCHED_14 = true;
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: API_URL_14,
                    onload(res) {
                        try { ITEMS_14 = JSON.parse(res.responseText); } catch (e) { ITEMS_14 = []; }
                        resolve(ITEMS_14);
                    },
                    onerror(err) { ITEMS_14 = []; resolve(ITEMS_14); }
                });
            });
        }

        function getKoromonValue14(id) {
            const it = ITEMS_14.find((i) => String(i.itemId) === String(id));
            return it && it.Value > 0 ? it.Value : 0;
        }

        function safeText14(el) { return el ? el.textContent.trim() : ""; }

        function hasClassPrefix14(el, prefix) {
            if (!el || !el.classList) return false;
            return [...el.classList].some((c) => typeof c === "string" && c.startsWith(prefix));
        }

        function findElementContainingText14(tagName, fragment) {
            const lower = String(fragment).toLowerCase();
            const els = tagName ? document.querySelectorAll(tagName) : document.querySelectorAll("*");
            for (const el of els) {
                if (el.textContent && el.textContent.toLowerCase().includes(lower)) return el;
            }
            return null;
        }

        function getFirstClassPrefix14(prefix, fallback) {
            try {
                const all = document.querySelectorAll("[class]");
                for (const el of all) {
                    for (const c of Array.from(el.classList)) {
                        if (c.startsWith(prefix)) return c;
                    }
                }
            } catch {}
            return fallback;
        }

        function formatValueShort14(n) {
            if (typeof n !== "number") return String(n);
            if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
            if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
            return String(n);
        }

        // ---- Catalog injector (1:1) ----
        const INLINE_ROBUX_SVG_14 = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="branded" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" xml:space="preserve">
  <style>.st0{fill:#02B757;}.st3{fill:#02B757;}</style>
  <g transform="translate(-2,-114)"><g>
    <path class="st3" d="m 14,138 c -6.6,0 -12,-5.4 -12,-12 0,-6.6 5.4,-12 12,-12 6.6,0 12,5.4 12,12 0,6.6 -5.4,12 -12,12 z m 0,-22 c -5.5,0 -10,4.5 -10,10 0,5.5 4.5,10 10,10 5.5,0 10,-4.5 10,-10 0,-5.5 -4.5,-10 -10,-10 z"/>
    <path class="st3" d="m 19,131 h -5 c -0.2,0 -0.4,-0.1 -0.6,-0.2 L 9,127.3 v 2.7 c 0,0.6 -0.4,1 -1,1 -0.6,0 -1,-0.4 -1,-1 v -8 c 0,-0.6 0.4,-1 1,-1 h 4 c 1.1,0 1.7,1.1 1.7,3 0,0.6 -0.1,1.2 -0.2,1.7 -0.4,1.2 -1.2,1.3 -1.5,1.3 h -0.1 l 2.5,2 H 19 c 0.3,0 0.5,-0.5 0.5,-1 0,-0.4 -0.1,-1 -0.5,-1 h -2 c -1.4,0 -2.5,-1.3 -2.5,-3 0,-0.7 0.2,-1.4 0.5,-1.9 0.5,-0.7 1.2,-1.1 2,-1.1 h 3 c 0.6,0 1,0.4 1,1 0,0.6 -0.4,1 -1,1 h -3 c -0.1,0 -0.2,0 -0.3,0.2 -0.1,0.2 -0.2,0.5 -0.2,0.8 0,0.4 0.2,1 0.5,1 h 2 c 1.4,0 2.5,1.3 2.5,3 0,1.7 -1.1,3 -2.5,3 z M 9,125 h 2.6 c 0.1,-0.5 0.1,-1.5 0,-2 H 9 Z"/>
  </g></g></svg>`;

        function removeCatalogInject14() {
            const oldStat = document.querySelector("#pk_value_statblock");
            if (oldStat) oldStat.remove();
            document.querySelector("#pk_koromon_link")?.remove();
        }

        function runCatalogInjector14(retry = true) {
            if (!location.pathname.startsWith("/catalog/")) {
                removeCatalogInject14();
                return;
            }

            const idMatch = location.pathname.match(/\/catalog\/(\d+)/);
            if (!idMatch) return;
            const itemId = idMatch[1];

            const label = findElementContainingText14("span", "Average Price") || findElementContainingText14("*", "Average Price");
            if (!label) {
                if (retry) setTimeout(() => runCatalogInjector14(false), 140);
                return;
            }

            let statBlock = label;
            for (let i = 0; i < 12; i++) {
                if (!statBlock) break;
                if (hasClassPrefix14(statBlock, "priceChartStat")) break;
                statBlock = statBlock.parentElement;
            }
            if (!statBlock || !hasClassPrefix14(statBlock, "priceChartStat")) {
                if (retry) setTimeout(() => runCatalogInjector14(false), 140);
                return;
            }

            const statsContainer = statBlock.parentElement || statBlock.parentNode;
            if (!statsContainer) {
                if (retry) setTimeout(() => runCatalogInjector14(false), 140);
                return;
            }

            if (document.querySelector("#pk_value_statblock")) {
                ensureKoromonLink14(itemId);
                return;
            }

            const numericSpan = [...statBlock.querySelectorAll("span")].find((s) =>
                /^[0-9,]+$/.test(s.textContent.trim())
            );
            if (!numericSpan) {
                if (retry) setTimeout(() => runCatalogInjector14(false), 140);
                return;
            }

            const korVal = getKoromonValue14(itemId);
            const formatted = korVal ? korVal.toLocaleString() : "-";

            const newStat = document.createElement("div");
            newStat.className = Array.from(statBlock.classList).join(" ");
            newStat.id = "pk_value_statblock";

            const textLabelClass = getFirstClassPrefix14("priceChartTextLabel", "priceChartTextLabel-0-2-125");
            const priceIconClass = getFirstClassPrefix14("priceIcon", "icon-robux priceIcon-0-2-200");
            const priceLabelClass = getFirstClassPrefix14("priceLabel", "priceLabel-0-2-201");

            newStat.innerHTML = `
      <span class="${textLabelClass}">Value</span>
      <div class="undefined flex">
        <div class="undefined flex">
          <span class="${priceIconClass}" aria-hidden="true">${INLINE_ROBUX_SVG_14}</span>
          <span class="${priceLabelClass}" style="color: #02b757;">${formatted}</span>
        </div>
      </div>
    `;

            statsContainer.appendChild(newStat);
            ensureKoromonLink14(itemId);
        }

        function ensureKoromonLink14(itemId) {
            if (document.querySelector("#pk_koromon_link")) return;
            const creatorLine = [...document.querySelectorAll("p, span, div")].find((e) => {
                const t = safeText14(e);
                return t.startsWith("By ") || /^By\s+\S+/.test(t);
            });
            if (creatorLine) {
                const link = document.createElement("p");
                link.id = "pk_koromon_link";
                link.style.margin = "5px 0";
                link.innerHTML = `<a href="https://www.koromons.xyz/item/${itemId}" target="_blank" style="color: inherit; font-weight: 600;">View on Koromons</a>`;
                creatorLine.insertAdjacentElement("afterend", link);
            }
        }

        // ---- Profile injector (1:1) ----
        function fetchKoromonsUser14(userId) {
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://www.koromons.xyz/api/users/${userId}`,
                    onload(res) {
                        try { resolve(JSON.parse(res.responseText)); } catch (e) { resolve(null); }
                    },
                    onerror(err) { resolve(null); }
                });
            });
        }

        function removeProfileValue14() {
            document.querySelectorAll("#pk_profile_value").forEach(n => n.remove());
        }

        function buildProfileLiHTML14(formatted, playerUrl, headerClass, textContainerClass, textClass) {
            return `
      <div class="${headerClass}">Value</div>
      <a class="${textContainerClass}" href="${playerUrl}" target="_blank">
        <h3 class="${textClass}" style="margin:0; font-weight:400; font-size:16px;">
          ${formatted}
        </h3>
      </a>
    `;
        }

        async function runProfileInjector14(retry = true) {
            const m = location.pathname.match(/^\/users\/(\d+)\/profile/);
            if (!m) {
                removeProfileValue14();
                return;
            }
            const userId = m[1];

            const statsList = [...document.querySelectorAll("[class]")].find((el) =>
                hasClassPrefix14(el, "relationshipList")
            );
            if (!statsList) {
                if (retry) setTimeout(() => runProfileInjector14(false), 180);
                return;
            }

            const data = await fetchKoromonsUser14(userId);
            if (!data || typeof data.totalValue !== "number") {
                if (retry) setTimeout(() => runProfileInjector14(false), 300);
                return;
            }

            const formatted = formatValueShort14(data.totalValue);

            const headerClass = getFirstClassPrefix14("statHeader", "statHeader-0-2-102");
            const textContainerClass = getFirstClassPrefix14("statTextContainer", "statTextContainer-0-2-104");
            const textClass = getFirstClassPrefix14("statText", "statText-0-2-105");

            const playerUrl = `https://www.koromons.xyz/player/${userId}`;

            const existing = statsList.querySelector("#pk_profile_value");
            if (existing) {
                try {
                    existing.innerHTML = buildProfileLiHTML14(formatted, playerUrl, headerClass, textContainerClass, textClass);
                } catch (e) {}
            } else {
                const li = document.createElement("li");
                li.id = "pk_profile_value";
                li.style.width = "20%";
                li.style.float = "left";
                li.style.padding = "0px 5px";
                li.style.textAlign = "center";

                li.innerHTML = buildProfileLiHTML14(formatted, playerUrl, headerClass, textContainerClass, textClass);

                const lis = Array.from(statsList.querySelectorAll("li"));
                let rapLi = null;
                for (const candidate of lis) {
                    const header = candidate.querySelector(`[class*="statHeader"]`);
                    if (header && header.textContent.trim().toLowerCase() === "rap") {
                        rapLi = candidate;
                        break;
                    }
                }

                if (rapLi) {
                    if (typeof rapLi.after === "function") rapLi.after(li);
                    else rapLi.parentNode.insertBefore(li, rapLi.nextSibling);
                } else {
                    statsList.appendChild(li);
                }
            }

            const finalLis = statsList.querySelectorAll("li");
            finalLis.forEach((item) => {
                try { item.style.width = "20%"; item.style.float = "left"; } catch {}
            });
        }

        // ---- Watcher / SPA runner ----
        function runner14() {
            try {
                if (location.pathname.startsWith("/catalog/")) {
                    runCatalogInjector14();
                } else if (/^\/users\/\d+\/profile/.test(location.pathname)) {
                    runProfileInjector14();
                } else {
                    removeCatalogInject14();
                    removeProfileValue14();
                }
            } catch (e) { console.error("ext14 runner error", e); }
        }

        (async function init14() {
            await loadKoromons14();
            runner14();

            let lastURL14 = location.href;
            setInterval(() => {
                if (location.href !== lastURL14) {
                    lastURL14 = location.href;
                    runner14();
                }
            }, 400);

            const _push14 = history.pushState;
            history.pushState = function () { _push14.apply(this, arguments); setTimeout(runner14, 300); };
            window.addEventListener("popstate", () => setTimeout(runner14, 300));

            new MutationObserver(() => {
                if (document.querySelector("#pk_value_statblock") || document.querySelector("#pk_profile_value")) return;
                runner14();
            }).observe(document.body, { childList: true, subtree: true });
        })();

    })();


    // ============================================================
    // #15 — Collectibles Value
    // 1:1 from koromons-trading-extensions.js (runCollectiblesInjector + insertSortBar)
    // ============================================================
    (function () {
        if (!extEnabled(15)) return;
        if (!location.href.includes("/internal/collectibles?userId=")) return;

        const API_URL_15 = "https://www.koromons.xyz/api/items";
        let ITEMS_15 = [];
        let FETCHED_15 = false;

        async function loadKoromons15() {
            if (FETCHED_15) return ITEMS_15;
            FETCHED_15 = true;
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: API_URL_15,
                    onload(res) {
                        try { ITEMS_15 = JSON.parse(res.responseText); } catch (e) { ITEMS_15 = []; }
                        resolve(ITEMS_15);
                    },
                    onerror(err) { ITEMS_15 = []; resolve(ITEMS_15); }
                });
            });
        }

        // ---- runCollectiblesInjector (1:1 logic, crash-safe) ----
        function runCollectiblesInjector15() {
            if (!location.href.includes("/internal/collectibles?userId=")) return;

            function computeValue15(itemId, rap) {
                const it = ITEMS_15.find((i) => String(i.itemId) === String(itemId));
                return it && it.Value > 0 ? it.Value : rap;
            }

            // Inject value into any card that doesn't have it yet
            document.querySelectorAll(".col-6.col-md-4.col-lg-2.mb-2").forEach((card) => {
                try {
                    const link = card.querySelector("a");
                    if (!link) return;
                    const match = link.href.match(/catalog\/(\d+)\//);
                    if (!match) return;
                    const itemId = match[1];

                    let rap = 0;
                    const rapEl = card.querySelector(".card-body p:nth-of-type(2)");
                    if (rapEl) {
                        const m = rapEl.textContent.match(/RAP:\s*([0-9,]+)/i);
                        if (m) rap = parseInt(m[1].replace(/,/g, ""), 10);
                    }

                    const val = computeValue15(itemId, rap);

                    // Only inject + count cards not yet processed
                    if (!card.querySelector(".pekora-value")) {
                        const p = document.createElement("p");
                        p.className = "pekora-value mb-0 fw-bolder";
                        p.style.color = "#00ff85";
                        p.style.marginTop = "5px";
                        p.textContent = "Value: " + val.toLocaleString();
                        const body = card.querySelector(".card-body") || card;
                        body.appendChild(p);

                        const title = card.querySelector(".card-body p.fw-bolder") || card.querySelector(".card-body p");
                        card.dataset.value = val;
                        card.dataset.rap = rap;
                        card.dataset.name = title ? title.textContent.trim() : "";
                    }
                } catch (e) {
                    console.debug("collectible card inject error", e);
                }
            });

            // Recompute total across ALL cards (already injected ones have dataset.value set)
            let TOTAL_VALUE = 0;
            document.querySelectorAll(".col-6.col-md-4.col-lg-2.mb-2").forEach((card) => {
                TOTAL_VALUE += Number(card.dataset.value) || 0;
            });

            const RAPelement = [...document.querySelectorAll(".fw-bolder")].find((el) => /Total RAP/i.test(el.textContent));
            if (RAPelement) {
                let valEl = document.querySelector("#pekora-total-value");
                if (!valEl) {
                    valEl = document.createElement("p");
                    valEl.id = "pekora-total-value";
                    valEl.style.color = "#00ff85";
                    valEl.style.fontWeight = "700";
                    valEl.style.marginTop = "5px";
                    RAPelement.insertAdjacentElement("afterend", valEl);
                }
                valEl.textContent = "Total Value: " + TOTAL_VALUE.toLocaleString();
            }

            insertSortBar15();
        }

        // ---- insertSortBar (1:1) ----
        function insertSortBar15() {
            const container = document.querySelector(".container");
            if (!container) return;

            let bar = document.querySelector("#pekora-sort-bar");
            if (!bar) {
                bar = document.createElement("div");
                bar.id = "pekora-sort-bar";
                bar.style.position = "absolute";
                bar.style.top = "10px";
                bar.style.right = "10px";
                bar.style.display = "flex";
                bar.style.gap = "6px";
                bar.style.zIndex = "99999";
                container.style.position = "relative";
                container.appendChild(bar);
            }

            const makeBtn15 = (id, text, color) => {
                const btn = document.createElement("button");
                btn.id = id;
                btn.className = `btn btn-sm btn-${color}`;
                btn.textContent = text;
                return btn;
            };

            const row = document.querySelector(".col-12.col-lg-9 .row");
            if (!row) return;

            function sortGrid15(type, asc) {
                const cards = [...row.querySelectorAll(".col-6.col-md-4.col-lg-2.mb-2")];
                cards.sort((a, b) => {
                    if (type === "name") {
                        const A = (a.dataset.name || "").toLowerCase();
                        const B = (b.dataset.name || "").toLowerCase();
                        return asc ? A.localeCompare(B) : B.localeCompare(A);
                    }
                    const A = Number(a.dataset[type] || 0);
                    const B = Number(b.dataset[type] || 0);
                    return asc ? A - B : B - A;
                });
                cards.forEach((c) => row.appendChild(c));
            }

            if (!document.querySelector("#btn-sort-value")) {
                const btn = makeBtn15("btn-sort-value", "Value ↓", "success");
                btn.onclick = () => {
                    const asc = !(btn.dataset.asc === "1");
                    btn.dataset.asc = asc ? "1" : "0";
                    btn.textContent = asc ? "Value ↑" : "Value ↓";
                    sortGrid15("value", asc);
                };
                bar.appendChild(btn);
            }

            if (!document.querySelector("#btn-sort-rap")) {
                const btn = makeBtn15("btn-sort-rap", "RAP ↓", "primary");
                btn.onclick = () => {
                    const asc = !(btn.dataset.asc === "1");
                    btn.dataset.asc = asc ? "1" : "0";
                    btn.textContent = asc ? "RAP ↑" : "RAP ↓";
                    sortGrid15("rap", asc);
                };
                bar.appendChild(btn);
            }

            if (!document.querySelector("#btn-sort-name")) {
                const btn = makeBtn15("btn-sort-name", "A → Z", "warning");
                btn.onclick = () => {
                    const asc = !(btn.dataset.asc === "1");
                    btn.dataset.asc = asc ? "1" : "0";
                    btn.textContent = asc ? "A → Z" : "Z → A";
                    sortGrid15("name", asc);
                };
                bar.appendChild(btn);
            }
        }

        // ---- init ----
        (async function init15() {
            await loadKoromons15();
            runCollectiblesInjector15();

            // Watch only for NEW cards being added (e.g. pagination).
            // Debounce + guard flag + disconnect-before-run prevent the observer
            // firing on our own DOM writes, which caused the infinite loop crash.
            let col15_debounce = null;
            let col15_running = false;
            const col15_mo = new MutationObserver((muts) => {
                const relevant = muts.some(m =>
                    m.addedNodes.length > 0 &&
                    [...m.addedNodes].some(n =>
                        n.nodeType === 1 &&
                        (n.classList && n.classList.contains('col-6') ||
                         n.querySelector && n.querySelector('.col-6'))
                    )
                );
                if (!relevant || col15_running) return;
                clearTimeout(col15_debounce);
                col15_debounce = setTimeout(() => {
                    col15_running = true;
                    col15_mo.disconnect();
                    try { runCollectiblesInjector15(); } catch(e) {}
                    col15_running = false;
                    col15_mo.observe(document.body, { childList: true, subtree: true });
                }, 400);
            });
            col15_mo.observe(document.body, { childList: true, subtree: true });
        })();

    })();






    // ============================================================
    // #16 — Banned Profile Overlay
    // View banned/deleted user profiles instead of getting 404.
    // Originally written by cooper (coollarper45) as a standalone
    // userscript — integrated here with full credit to the author.
    // https://www.pekora.zip/users/51543/profile
    // ============================================================
    (function () {
        if (!extEnabled(16)) return;
        if (!/^\/users\/\d+\/profile/.test(location.pathname)) return;

        var BASE = 'https://www.pekora.zip';
        function api(path) { return fetch(BASE + path, { credentials: 'include' }).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }); }
        function getUserIdFromURL() { var m = location.pathname.match(/^\/users\/(\d+)\/profile/); return m ? m[1] : null; }
        function isBannedPage() {
            try { var nd = JSON.parse(document.getElementById('__NEXT_DATA__').textContent); var pp = nd && nd.props && nd.props.pageProps; if (pp && (pp.statusCode === 404 || (pp.username && pp.username.includes('Account Deleted')) || !pp.username)) return true; } catch (e) {}
            if (document.querySelector('img[alt="404"]')) return true; return false;
        }
        function fmt(n) { if (n == null) return '?'; if (n >= 1e6) return Math.floor(n/1e6)+'M+'; if (n >= 1e3) return Math.floor(n/1e3)+'K+'; return String(n); }
        function fmtDate(iso) { if (!iso || iso.startsWith('0001')) return 'Unknown'; try { return new Date(iso).toLocaleDateString(); } catch (e) { return iso; } }
        function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
        function resolveImg(url) { return !url ? BASE+'/img/placeholder.png' : url.startsWith('http') ? url : BASE+url; }
        function slug(n) { return (n||'Item').replace(/[^a-zA-Z0-9]/g,'-').replace(/-+/g,'-'); }

        function injectCSS() {
            if (document.getElementById('buv-styles')) return;
            var s = document.createElement('style'); s.id = 'buv-styles';
            s.textContent = '.buv-card{border:0;margin:0 0 18px;background:var(--white-color);box-shadow:none;border-radius:0}.buv-profileHeader{margin-bottom:0}.buv-profileHeader h1,.buv-profileHeader h2,.buv-profileHeader h3,.buv-profileHeader h4,.buv-profileHeader h5{padding:5px 0;line-height:1em}.buv-cardBody{padding:15px!important}.buv-thumbContainer{float:left;padding:0}@media(max-width:767px){.buv-thumbContainer{display:flex;align-items:center;justify-content:center}}.buv-userInfo{width:calc(100% - 128px - 12px)!important}@media(max-width:767px){.buv-userInfo{width:100%!important;display:flex;flex-direction:column}}.buv-headshot{width:128px;border:1px solid #b8b8b8;height:128px;padding:0;position:relative;margin-right:12px;border-radius:50%;vertical-align:bottom;background-color:#d1d1d1}@media(max-width:767px){.buv-headshot{width:100px;height:100px;margin:0}}.buv-headshot img{border-radius:50%;vertical-align:bottom;width:100%;height:100%}.buv-activity{float:right;right:5%;bottom:4%;margin:0;position:absolute}.buv-username{margin:0;font-size:32px;font-weight:800}@media(max-width:767px){.buv-username{display:flex;position:relative;justify-content:center}}.buv-status{margin:0;font-size:16px;font-weight:400;line-height:1.4em}.buv-statusMargin{margin-bottom:8px}.buv-statusHidden{}@media(max-width:767px){.buv-statusHidden{display:none}}.buv-altIcon{bottom:2.5px;position:relative}.buv-relContainer{justify-content:space-between}@media(max-width:767px){.buv-relContainer{margin-top:6px}}.buv-relList{float:left;width:55%;height:54px;margin:0;padding:0;list-style:none}@media(max-width:767px){.buv-relList{width:100%}}.buv-relList::after{content:"";display:table;clear:both}.buv-statHeader{color:var(--text-color-secondary);margin:0;font-size:18px;text-align:center;font-weight:500;line-height:1.4em}@media(max-width:767px){.buv-statHeader{font-size:16px}}.buv-statLink{color:var(--primary-color)!important;text-decoration:none!important}.buv-statLink:hover{text-decoration:underline!important}.buv-statText{color:var(--primary-color)!important;margin:0;padding:5px 0;font-size:20px;font-weight:400;line-height:1em;text-decoration:none!important}@media(max-width:767px){.buv-statText{padding:0}}.buv-tabBar{color:var(--text-color-primary);width:100%;border:0;display:flex;padding:0;text-align:center;flex-direction:row;background-color:var(--white-color)}.buv-tab{flex:1;float:left;display:inline-block;margin-bottom:-1px}.buv-tabLabel{border:0;margin:0;padding:12px 2%;font-size:16px;font-weight:400;line-height:1em;background-color:var(--white-color)}.buv-tabActive{box-shadow:inset 0 -4px 0 0 var(--primary-color)!important;cursor:default}.buv-tabInactive{box-shadow:none!important;cursor:pointer}.buv-tabInactive:hover{background:var(--white-color-hover,#f5f5f5)}.buv-tabText{margin:0;display:inline-block;font-weight:500;line-height:1em}.buv-selected{margin-top:6px;margin-bottom:6px}.buv-header{padding:0 0 5px;font-size:20px;font-weight:700;line-height:1.4em;margin-bottom:0}.buv-aboutBody{padding:15px!important;font-size:16px;font-weight:300;white-space:break-spaces;margin-bottom:15px}.buv-report{padding-bottom:40px}.buv-reportWrap{float:right}.buv-reportText{font-size:10px;margin-top:15px;margin-bottom:0}.buv-reportText:hover>a{color:#F00}.buv-reportText:hover>a>span{background-image:url("/img/abuse.png")}.buv-reportLink{color:#F99;padding-left:2px;text-decoration:none}.buv-reportIcon{float:left;width:14px;height:13px;display:block}.buv-pastBody{padding:10px 20px;font-size:12px;font-weight:300;margin-bottom:0}.buv-pastLabel{color:var(--text-color-secondary);cursor:pointer;font-size:12px;font-weight:500;user-select:none}.buv-pastIcon{width:20px;height:20px;opacity:.5;display:inline-block;vertical-align:middle}.buv-pastTooltip{width:150px;display:flex;opacity:1;padding:4px 8px;z-index:99;overflow:visible;position:absolute;background:rgba(0,0,0,0.65);flex-direction:column}.buv-pastName{color:#fff;display:flex;margin-bottom:0}.buv-socialLink{float:left;width:32px;height:32px;margin-left:6px}.buv-avatarWrap{margin:0 auto;display:block;max-width:300px}.buv-avatarCard{border:0;position:relative;min-height:300px;border-radius:0;background-color:var(--white-color)}.buv-avatarCard img{width:100%;height:auto}.buv-wearingCard{border:0!important;height:100%;background:#3b7599;border-radius:0}.buv-restrictions{left:-3px;bottom:-3px;overflow:hidden;position:absolute;border-bottom-left-radius:10.5px}.buv-wearingImg{width:100%;height:auto}.buv-friendRow{display:flex;padding:15px!important;flex-flow:row;max-height:150px;overflow-x:auto;overflow-y:hidden;align-items:center;margin-bottom:0;justify-content:flex-start;list-style:none}.buv-friendItem{float:left;width:11.11111%;height:120px;position:relative;min-width:100px;list-style:none}.buv-friendAvatarWrap{width:90px;margin:auto;position:relative;font-size:16px;font-weight:400;line-height:1.4em}.buv-friendLink{margin:0 auto;position:relative;text-decoration:none}.buv-friendAvatar{width:100%;border:0;height:100%;display:block;box-shadow:0 1px 4px 0 rgba(25,25,25,0.3);text-align:center;transition:box-shadow 200ms ease;border-radius:50%;background-color:#d1d1d1}.buv-friendAvatar:hover{box-shadow:0 1px 6px 0 rgba(25,25,25,0.75)}.buv-friendAvatar img{border-radius:50%;vertical-align:bottom;background-color:#d1d1d1;width:100%}.buv-friendName{margin:3px 0 0;display:block;overflow:hidden;font-size:12px;text-align:center;font-weight:500;line-height:1.867em;white-space:nowrap;text-overflow:ellipsis;text-decoration:none}.buv-seeAllWrap{float:right;width:100px;height:100%;display:flex;margin-top:0;align-items:flex-end;justify-content:flex-end}.buv-seeAll{color:var(--primary-color)!important;padding:4px;font-size:16px;text-align:center;font-weight:500;text-decoration:none!important}.buv-seeAll:hover{text-decoration:underline!important}.buv-itemWrap{border:1px solid var(--text-color-quinary,#ccc);position:relative;border-radius:0}.buv-itemImg{width:100%;margin:0 auto;display:block;padding:0}.buv-itemLabel{overflow:hidden;font-size:16px;font-weight:500;white-space:nowrap;text-overflow:ellipsis}.buv-itemLimitWrap{left:-2px;width:100%;bottom:-2px;overflow:hidden;position:absolute}.buv-groupHeaders{display:flex;flex-direction:row}.buv-iconCard{height:100%;background:#0074bd;align-content:center;border-radius:0;min-height:240px;position:relative;overflow:hidden}.buv-iconImg{width:240px;height:240px;margin:0 auto;display:block;border-radius:12px}.buv-cursor{width:50px;cursor:pointer;height:50px;position:absolute;background:rgba(0,0,0,0.5);border-radius:100%;z-index:10;top:50%;transform:translateY(-50%);opacity:0;transition:opacity 0.15s}.buv-groupSlidePair:hover .buv-cursor{opacity:1}.buv-cursor:hover{background:rgba(0,0,0,0.75)}.buv-cursorBack{left:20px;border:2px solid white}.buv-cursorFwd{right:20px;border:2px solid white}.buv-cursorChevron{color:white;font-size:40px;user-select:none;display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:1}.buv-groupCard{border:0;height:300px;padding:20px 30px;border-radius:0;background-color:var(--white-color);display:flex;flex-direction:column}.buv-groupName{margin:0;padding:5px 0;font-size:32px;font-weight:800;border-bottom:1px solid var(--white-color)}.buv-groupDesc{height:100px;margin:0;hyphens:none;overflow:hidden;font-size:16px;word-wrap:break-word;border-top:1px solid var(--text-color-secondary);font-weight:400;line-height:1.5em;white-space:pre-wrap;text-overflow:ellipsis}.buv-groupStatH{color:var(--text-color-secondary);font-size:16px;font-weight:500;line-height:1.4em;margin-bottom:0}.buv-groupStatV{font-size:16px;font-weight:500;margin-bottom:0}.buv-toggleBtn{color:white;text-align:center;text-decoration:none;cursor:pointer}.buv-btnWrap{color:white;width:100%;padding:5px 10px;background:var(--primary-color);text-align:center;border-radius:4px}.buv-btnWrap:hover{background:#32B5FF;box-shadow:0 1px 3px rgb(150 150 150 / 74%)}.buv-btnInUse{padding-top:0;padding-bottom:0}.buv-btnNotInUse{border:1px solid var(--text-color-quinary);background:white!important;padding-top:0;padding-bottom:0}.buv-groupGrid{display:flex;flex-wrap:wrap}.buv-groupGridItem{padding:0}.buv-groupGridItem .card{background-color:var(--white-color)}.buv-groupGridImg{width:100%;display:block}.buv-groupGridName{font-size:14px;font-weight:600;margin-bottom:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.buv-groupGridCount{font-size:12px;color:var(--text-color-secondary);margin-bottom:0}.buv-gamesContainer{display:flex;gap:10px;margin:0;padding:0 0 50px;list-style:none;overflow-x:auto;overflow-y:visible}.buv-gameItem{flex-shrink:0;width:150px;list-style:none}@media(max-width:767px){.buv-gameItem{width:120px}}.buv-creationsContainer{display:flex;flex-wrap:wrap;gap:10px;margin:0;padding:0;list-style:none}.buv-creationsContainer .buv-gameItem{flex-shrink:0;width:calc(16.666% - 9px);min-width:120px}@media(max-width:991px){.buv-creationsContainer .buv-gameItem{width:calc(25% - 8px)}}@media(max-width:767px){.buv-creationsContainer .buv-gameItem{width:calc(33.333% - 7px)}}.buv-gameCard{width:100%;margin:0;padding:0;position:relative;font-size:16px;box-shadow:0 1px 4px 0 rgba(25,25,25,0.3);text-align:left;font-weight:300;line-height:1.3em;white-space:normal;border-radius:3px;background-color:var(--white-color)}.buv-gameCard:hover{z-index:999;box-shadow:0 1px 6px 0 rgba(25,25,25,0.75);transition:box-shadow 200ms ease}.buv-gameCard:hover .buv-gameFooter{display:flex}.buv-gameLink{color:inherit;cursor:pointer;display:flex;flex-direction:column;text-decoration:none!important}.buv-gameThumb{width:100%;aspect-ratio:1/1;overflow:hidden;border-top-left-radius:3px;border-top-right-radius:3px}.buv-gameThumb img{width:100%;height:100%;object-fit:cover;border-top-left-radius:3px;border-top-right-radius:3px}.buv-gameTitle{cursor:pointer;margin:3px 0;padding:0 6px;overflow:hidden;margin-top:6px;line-height:1.3em;white-space:nowrap;text-overflow:ellipsis}.buv-gamePlaying{color:var(--text-color-tertiary);width:100%;margin:3px 0;padding:0 6px;font-size:12px;font-weight:400;line-height:1.3em;display:flex;justify-content:space-between}.buv-gameVote{width:100%;margin:3px 0;padding:0 6px}.buv-voteBar{height:20px;position:relative;overflow:visible}.buv-voteBar::before{content:"";display:table}.buv-voteBar::after{content:"";display:table;clear:both}.buv-voteThumbUp{float:left;display:flex!important}.buv-voteContainer{float:left;width:calc(99% - 32px);height:6px;margin:9px auto 0 1%;position:relative}.buv-voteBg{top:0;left:0;width:100%;height:100%;position:absolute;background-color:var(--text-color-secondary)}.buv-votePercent{top:0;left:0;height:100%;position:absolute;background-color:var(--text-color-tertiary)}.buv-voteSeg{top:0;width:2px;height:6px;position:absolute;background-color:var(--white-color)}.buv-voteThumbDown{float:left;display:flex!important;opacity:.6}.buv-voteThumbDown span{background-position:0 -16px}.buv-gameFooter{display:none;position:absolute;bottom:0;left:0;width:100%;transform:translateY(100%);flex-direction:column;background-color:var(--white-color);box-shadow:0 1px 6px 0 rgba(25,25,25,0.75);clip-path:inset(0 -10px -10px -10px);border-bottom-left-radius:3px;border-bottom-right-radius:3px;z-index:1000}.buv-voteCounts{width:89%;cursor:pointer;margin:auto;display:flex;padding:0 2px 5px;justify-content:space-between}.buv-voteCounts div{font-size:12px;font-weight:300;line-height:1.3em}.buv-gameItem.has-votes:hover .buv-voteBg{opacity:.6;background-color:var(--bad-color)}.buv-gameItem.has-votes:hover .buv-votePercent{background-color:#02b757}.buv-gameItem.has-votes:hover .icon-thumbs-up{color:#02b757}.buv-gameItem.has-votes:hover .icon-thumbs-down{color:var(--bad-color)}.buv-upvoteCount{float:right;color:#02b757}.buv-downvoteCount{float:left;color:var(--bad-color);opacity:.6}.buv-gameFooterInner{width:100%;border-top:1px solid var(--background-color);line-height:1.3em;white-space:normal;display:block}.buv-gameCreator{padding:5px 5px 0}.buv-gameCreatorText{color:var(--text-color-secondary);width:100%;display:inline;overflow:hidden;font-size:12px;font-weight:400;line-height:1.3em!important;white-space:nowrap;text-overflow:ellipsis}.buv-gameCreatorText a{color:var(--primary-color);display:inline;text-decoration:none!important}.buv-gameCreatorText a:hover{text-decoration:underline!important}.buv-playerCount{color:var(--text-color-primary);user-select:none;margin-bottom:0}.buv-yearText{color:var(--text-color-primary);font-weight:400;user-select:none;margin-bottom:0}.buv-koroneImgWrap{display:flex;align-items:center;justify-content:center;border:1px solid var(--text-color-secondary);height:142px;overflow:hidden;border-radius:0}.buv-koroneImgWrap span{font-size:48px}.buv-koroneLabel{width:100%;overflow:hidden;font-size:16px;font-weight:500;line-height:1.4em;white-space:nowrap;text-overflow:ellipsis}.buv-statsPad{padding:15px!important}.buv-statsLabel{color:var(--text-color-secondary);overflow:hidden;font-size:16px;text-align:center;font-weight:400;white-space:nowrap;margin-bottom:0}.buv-statsValue{font-size:18px;margin-top:5px;text-align:center;margin-bottom:0!important}.buv-lastOnline{color:var(--text-color-secondary);font-size:12px;text-align:center;margin-top:4px}';
            document.head.appendChild(s);
        }

        function buildGameCard(detail, voteMap, iconMap) {
            var uniId = detail.universeId;
            var img = resolveImg(iconMap[uniId]);
            var n = detail.name || 'Game';
            var y = detail.year || '????';
            var placeId = detail.universeRootPlaceId || detail.placeId;
            var pc = detail.playerCount || 0;
            var builder = detail.builder || '?';
            var builderId = detail.builderId;
            var builderType = detail.builderType;
            var builderLink = builderType === 'Group'
                ? '/My/Groups.aspx?gid=' + builderId
                : '/User.aspx?ID=' + builderId;
            var votes = voteMap[uniId] || {};
            var up = votes.upVotes != null ? votes.upVotes : 0;
            var dn = votes.downVotes != null ? votes.downVotes : 0;
            var total = up + dn;
            var pct = total > 0 ? Math.round((up / total) * 100) : 0;
            return '<li class="buv-gameItem' + (total > 0 ? ' has-votes' : '') + '">' +
'<div class="buv-gameCard">' +
'<a href="/games/' + placeId + '/' + slug(n) + '" class="buv-gameLink">' +
'<div class="buv-gameThumb"><img src="' + img + '"></div>' +
'<div class="buv-gameTitle" title="' + esc(n) + '">' + esc(n) + '</div>' +
'<div class="buv-gamePlaying"><p class="buv-playerCount">' + pc + ' Playing</p><p class="buv-yearText">' + y + '</p></div>' +
'<div class="buv-gameVote"><div class="buv-voteBar">' +
'<div class="buv-voteThumbUp"><span class="icon-thumbs-up"></span></div>' +
'<div class="buv-voteContainer">' +
'<div class="buv-voteBg"></div>' +
'<div class="buv-votePercent" style="width:' + pct + '%"></div>' +
'<div>' +
'<div class="buv-voteSeg" style="left:18%"></div>' +
'<div class="buv-voteSeg" style="left:38%"></div>' +
'<div class="buv-voteSeg" style="left:58%"></div>' +
'<div class="buv-voteSeg" style="left:78%"></div>' +
'</div></div>' +
'<div class="buv-voteThumbDown"><span class="icon-thumbs-down"></span></div>' +
'</div></div></a>' +
'<div class="buv-gameFooter">' +
'<div class="buv-voteCounts"><div class="buv-upvoteCount">' + up + '</div><div class="buv-downvoteCount">' + dn + '</div></div>' +
'<div class="buv-gameFooterInner"><div class="buv-gameCreator"><span class="buv-gameCreatorText">By <a href="' + esc(builderLink) + '">' + esc(builder) + '</a></span></div></div>' +
'</div></div></li>';
        }

        async function fetchPlaceData(placeIds) {
            if (!placeIds || !placeIds.length) return { detailMap: {}, voteMap: {}, iconMap: {} };
            var allDetails = [];
            for (var c = 0; c < placeIds.length; c += 50) {
                var chunk = placeIds.slice(c, c + 50);
                var res = await api('/apisite/games/v1/games/multiget-place-details?placeIds=' + chunk.join(','));
                if (Array.isArray(res)) allDetails = allDetails.concat(res);
            }
            var detailMap = {};
            var universeIds = [];
            allDetails.forEach(function(d) {
                detailMap[d.placeId] = d;
                if (d.universeId && universeIds.indexOf(d.universeId) === -1) universeIds.push(d.universeId);
            });
            var voteMap = {};
            var iconMap = {};
            for (var uc = 0; uc < universeIds.length; uc += 50) {
                var uChunk = universeIds.slice(uc, uc + 50);
                var extras = await Promise.all([
                    api('/apisite/games/v1/games/votes?universeIds=' + uChunk.join('%2C')),
                    api('/apisite/thumbnails/v1/games/icons?universeIds=' + uChunk.join('%2C') + '&format=png&size=420x420'),
                ]);
                ((extras[0] && extras[0].data) ? extras[0].data : []).forEach(function(v) { voteMap[v.id] = v; });
                ((extras[1] && extras[1].data) ? extras[1].data : []).forEach(function(d) { iconMap[d.targetId] = d.imageUrl; });
            }
            return { detailMap: detailMap, voteMap: voteMap, iconMap: iconMap };
        }

        function renderGameCards(placeIds, placeData) {
            var html = '';
            for (var i = 0; i < placeIds.length; i++) {
                var detail = placeData.detailMap[placeIds[i]];
                if (detail) html += buildGameCard(detail, placeData.voteMap, placeData.iconMap);
            }
            return html;
        }

        async function fetchAll(uid) {
            var results = await Promise.all([
                api('/apisite/users/v1/users/' + uid),
                api('/apisite/users/v1/users/' + uid + '/status'),
                api('/apisite/friends/v1/users/' + uid + '/followers/count'),
                api('/apisite/friends/v1/users/' + uid + '/followings/count'),
                api('/apisite/friends/v1/users/' + uid + '/friends'),
                api('/apisite/badges/v1/users/' + uid + '/badges?limit=6'),
                api('/apisite/accountinformation/v1/users/' + uid + '/roblox-badges'),
                api('/apisite/thumbnails/v1/users/avatar?userIds=' + uid + '&size=420x420&format=png'),
                api('/apisite/thumbnails/v1/users/avatar-headshot?userIds=' + uid + '&size=420x420&format=png'),
                api('/apisite/avatar/v1/users/' + uid + '/avatar'),
                api('/users/profile/robloxcollections-json?userId=' + uid),
                api('/apisite/groups/v1/users/' + uid + '/groups/roles'),
                api('/users/favorites/list-json?userId=' + uid + '&assetTypeId=9&pageNumber=1&itemsPerPage=6'),
                api('/apisite/accountinformation/v1/users/' + uid + '/promotion-channels?alwaysReturnUrls=true'),
                api('/apisite/users/v1/users/' + uid + '/username-history?limit=100&cursor='),
            ]);
            return {
                user: results[0], status: results[1], followers: results[2], followings: results[3],
                friends: results[4], badges: results[5], robloxBadges: results[6], avatar: results[7],
                headshot: results[8], wearing: results[9], collections: results[10], groups: results[11],
                favGames: results[12], promoChannels: results[13], usernameHistory: results[14]
            };
        }

        async function fetchThumbs(ids, type) {
            if (!ids || !ids.length) return {};
            var j = ids.join('%2C');
            var p;
            if (type === 'groups') p = '/apisite/thumbnails/v1/groups/icons?groupIds=' + j + '&size=150x150&format=png';
            else if (type === 'assets') p = '/apisite/thumbnails/v1/assets?assetIds=' + j + '&format=png&size=150x150';
            else if (type === 'avatar') p = '/apisite/thumbnails/v1/users/avatar?userIds=' + j + '&size=420x420&format=png';
            else p = '/apisite/thumbnails/v1/users/avatar-headshot?userIds=' + j + '&size=150x150&format=png';
            var r = await api(p);
            var m = {};
            var data = (r && r.data) ? r.data : [];
            data.forEach(function(d) { m[d.targetId] = d.imageUrl; });
            return m;
        }

        async function render(uid) {
            var D = await fetchAll(uid);
            var user = D.user, status = D.status, followers = D.followers, followings = D.followings;
            var friends = D.friends, badges = D.badges, robloxBadges = D.robloxBadges;
            var avatar = D.avatar, headshot = D.headshot, wearing = D.wearing;
            var collections = D.collections, groups = D.groups, favGames = D.favGames;
            var promoChannels = D.promoChannels, usernameHistory = D.usernameHistory;

            if (!user) {
                var mainFail = document.querySelector('.main-0-2-29') || document.body;
                var errEl = mainFail.querySelector('.col-12.h-100');
                if (errEl) errEl.remove();
                var cDiv = document.createElement('div');
                cDiv.className = 'container-0-2-32 container';
                cDiv.innerHTML = '<div style="padding:40px;text-align:center"><h2>User #' + uid + '</h2><p>Could not retrieve this account.</p></div>';
                mainFail.appendChild(cDiv);
                return;
            }
            injectCSS();

            var un = user.name || 'User_' + uid;
            var desc = user.description || '';
            var ban = user.isBanned;
            var ver = user.hasVerifiedBadge;
            var jd = fmtDate(user.created);
            var fl = (friends && friends.data) ? friends.data : [];
            var fc = fl.length;
            var foc = (followers && followers.count != null) ? fmt(followers.count) : '?';
            var fic = (followings && followings.count != null) ? fmt(followings.count) : '?';
            var us = (status && status.status) ? status.status : '';
            var rap = (user.inventoryRap != null) ? fmt(user.inventoryRap) : '?';
            var hu = resolveImg(headshot && headshot.data && headshot.data[0] ? headshot.data[0].imageUrl : null);
            var au = resolveImg(avatar && avatar.data && avatar.data[0] ? avatar.data[0].imageUrl : null);
            var pn = (usernameHistory && usernameHistory.data) ? usernameHistory.data : [];

            var ugRaw = await api('/apisite/games/v2/users/' + uid + '/games?limit=50&cursor=');
            var ugItems = (ugRaw && ugRaw.data) ? ugRaw.data : [];
            var pvTotal = ugItems.length ? ugItems.reduce(function(sum, g) { return sum + (g.placeVisits || 0); }, 0) : 0;
            var pv = fmt(pvTotal);
            var ugPlaceIds = ugItems.map(function(g) { return g.rootPlaceId; }).filter(Boolean);
            var ugPlaceData = await fetchPlaceData(ugPlaceIds);
            var ugContent = '';
            if (ugPlaceIds.length) {
                var ugCardsHTML = renderGameCards(ugPlaceIds, ugPlaceData);
                ugContent = ugCardsHTML ? '<div class="buv-creationsContainer">' + ugCardsHTML + '</div>' : '<div class="section-content-off">No games to display.</div>';
            } else {
                ugContent = '<div class="section-content-off">No games to display.</div>';
            }

            var fH = '';
            if (fc) {
                var fi = fl.slice(0, 10).map(function(f) { return f.id; });
                var ft = await fetchThumbs(fi, 'avatar');
                fH = fl.slice(0, 10).map(function(f) {
                    var fImg = resolveImg(ft[f.id]);
                    var fName = f.name || '[ Account Deleted (' + f.id + ') ]';
                    return '<li class="buv-friendItem"><div class="buv-friendAvatarWrap"><a class="buv-friendLink" href="/users/' + f.id + '/profile"><span class="buv-friendAvatar"><img src="' + fImg + '" alt="' + esc(fName) + '"></span><span class="buv-friendName link2019">' + esc(fName) + '</span></a></div></li>';
                }).join('');
            }

            var cH = '';
            var ci = (collections && collections.CollectionsItems) ? collections.CollectionsItems.slice(0, 6) : [];
            if (ci.length) {
                cH = ci.map(function(item) {
                    var cId = item.Id, cName = item.Name || 'Item';
                    var cImg = resolveImg(item.Thumbnail ? item.Thumbnail.Url : null);
                    var cTag = (item.AssetRestrictionIcon && item.AssetRestrictionIcon.CssTag) ? item.AssetRestrictionIcon.CssTag : null;
                    var cLbl = cTag ? '<div class="buv-itemLimitWrap"><span class="icon-' + cTag + '-label"></span></div>' : '';
                    return '<div class="col-4 col-lg-2 ml-1 mr-1"><a href="/catalog/' + cId + '/' + slug(cName) + '"><div class="buv-itemWrap"><img class="buv-itemImg" src="' + cImg + '">' + cLbl + '</div><p class="mb-0 link2019 buv-itemLabel">' + esc(cName) + '</p></a></div>';
                }).join('');
            }

            var wearAssets = (wearing && wearing.assets) ? wearing.assets.slice(0, 8) : [];
            var wH = '';
            if (wearAssets.length) {
                var wids = wearAssets.map(function(w) { return w.id; });
                var wt = await fetchThumbs(wids, 'assets');
                wH = wearAssets.map(function(w) {
                    var wName = w.name || 'Item';
                    var wImg = resolveImg(wt[w.id]);
                    return '<div class="col-3 pt-2 ps-1 pe-1"><div class="card" title="' + esc(wName) + '"><a title="' + esc(wName) + '" href="/catalog/' + w.id + '/' + slug(wName) + '"><img class="buv-wearingImg pt-0" src="' + wImg + '"></a><div class="buv-restrictions"></div></div></div>';
                }).join('');
            }

            var gl = (groups && groups.data) ? groups.data.slice(0, 12) : [];
            var groupSlideshowHTML = '', groupGridHTML = '';
            if (gl.length) {
                var gids = gl.map(function(entry) { return entry.group.id; });
                var gt = await fetchThumbs(gids, 'groups');
                var hasMultiple = gl.length > 1;
                var slidesArr = gl.map(function(entry, idx) {
                    var grp = entry.group, role = entry.role;
                    var gImg = resolveImg(gt[grp.id]);
                    var gDesc = grp.description || '';
                    return '<div class="buv-groupSlidePair" data-idx="' + idx + '" style="display:' + (idx === 0 ? 'flex' : 'none') + ';width:100%;position:relative">' +
(hasMultiple ? '<div class="buv-cursor buv-cursorBack buv-grp-back"><span class="buv-cursorChevron">&#8249;</span></div>' : '') +
'<div class="col-12 col-lg-6 pe-lg-0"><div class="buv-iconCard"><a href="/My/Groups.aspx?gid=' + grp.id + '"><img class="buv-iconImg" src="' + gImg + '"></a></div></div>' +
'<div class="col-12 col-lg-6 ps-lg-0"><div class="card buv-groupCard"><h3 class="buv-groupName">' + esc(grp.name) + '</h3><p class="buv-groupDesc">' + esc(gDesc) + '</p>' +
'<div class="flex" style="margin-top:auto"><div class="col-6"><p class="buv-groupStatH">Members</p><p class="buv-groupStatV">' + fmt(grp.memberCount) + '</p></div>' +
'<div class="col-6"><p class="buv-groupStatH">Rank</p><p class="buv-groupStatV">' + esc(role ? role.name : '?') + '</p></div></div></div></div>' +
(hasMultiple ? '<div class="buv-cursor buv-cursorFwd buv-grp-fwd"><span class="buv-cursorChevron">&#8250;</span></div>' : '') +
'</div>';
                });
                groupSlideshowHTML = '<div id="buv-group-slides" class="flex">' + slidesArr.join('') + '</div>';
                groupGridHTML = '<div class="flex buv-groupGrid" id="buv-groups-grid" style="display:none">' +
                    gl.map(function(entry) {
                        var grp = entry.group, role = entry.role;
                        var gImg = resolveImg(gt[grp.id]);
                        return '<div class="col-6 col-lg-2 pe-0 ps-0 buv-groupGridItem"><a href="/My/Groups.aspx?gid=' + grp.id + '"><div class="card pt-1 pb-1 pe-1 ps-1"><img class="buv-groupGridImg" src="' + gImg + '"><div class="pe-1 ps-1"><p class="buv-groupGridName">' + esc(grp.name) + '</p><p class="buv-groupGridCount">' + fmt(grp.memberCount) + ' Members</p><p class="buv-groupGridCount">' + esc(role ? role.name : '?') + '</p></div></div></a></div>';
                    }).join('') + '</div>';
            }
            var groupsBodyHTML = '<div class="col-12">' + groupSlideshowHTML + groupGridHTML + '</div>';

            var gameItems = (favGames && favGames.Data && favGames.Data.Items) ? favGames.Data.Items.slice(0, 6) : [];
            var gamesContent = '';
            if (gameItems.length) {
                var favPlaceIds = gameItems.map(function(g) { return g.Item.AssetId; });
                var favPlaceData = await fetchPlaceData(favPlaceIds);
                var favCardsHTML = renderGameCards(favPlaceIds, favPlaceData);
                gamesContent = favCardsHTML ? '<div class="buv-gamesContainer">' + favCardsHTML + '</div>' : '<div class="section-content-off">User has no favourited games.</div>';
            } else {
                gamesContent = '<div class="section-content-off">User has no favourited games.</div>';
            }

            var rb = Array.isArray(robloxBadges) ? robloxBadges : [];
            var kbH = '';
            if (rb.length) {
                var kbi = rb.map(function(b) {
                    var bName = b.name || '';
                    var bClass = bName.toLowerCase().replace(/\s+/g, '');
                    return '<div class="col-4 col-lg-2"><a href="/Badges.aspx"><div class="buv-koroneImgWrap"><span class="icon-' + bClass + '"></span></div><p class="buv-koroneLabel link2019 mb-0">' + esc(bName) + '</p></a></div>';
                }).join('');
                kbH = '<div class="flex d-none d-lg-flex marginStuff"><div class="col-10"><h3 class="buv-header">Korone Badges (' + rb.length + ')</h3></div><div class="col-12"><div class="card pt-4 pb-4 pe-4 ps-4" style="border:0;border-radius:0;background:var(--white-color)"><div class="flex">' + kbi + '</div></div></div></div>';
            }

            var bl = (badges && badges.data) ? badges.data.slice(0, 6) : [];
            var bH = '';
            if (bl.length) {
                var bids = bl.map(function(b) { return b.id; });
                var bt = await fetchThumbs(bids, 'assets');
                bH = bl.map(function(b) {
                    var bName = b.name || 'Badge';
                    var bImg = resolveImg(bt[b.id]);
                    return '<div class="col-4 col-lg-2 ml-1 mr-1" style="width:calc(16.6667% - 3px)"><a href="/catalog/' + b.id + '/' + slug(bName) + '"><div class="buv-itemWrap"><img class="buv-itemImg" src="' + bImg + '"></div><p class="mb-0 link2019 buv-itemLabel">' + esc(bName) + '</p></a></div>';
                }).join('');
            }

            var pnH = '';
            if (pn.length) {
                var ni = pn.map(function(entry) { return '<p class="buv-pastName">' + esc(entry.name) + '</p>'; }).join('');
                pnH = '<div><p class="buv-pastLabel buv-pastBody"><span><span class="icon-pastname buv-pastIcon"></span> Past usernames</span></p><div class="buv-pastTooltip">' + ni + '</div></div>';
            }

            var sH = '';
            if (promoChannels) {
                var socialMap = {Twitter:'twitter',Twitch:'twitch',YouTube:'youtube',Facebook:'facebook',Discord:'discord',Guilded:'guilded',TikTok:'tiktok'};
                var socialKeys = Object.keys(socialMap);
                for (var si = 0; si < socialKeys.length; si++) {
                    var sk = socialKeys[si], sic = socialMap[sk];
                    var su = promoChannels[sk] || promoChannels[sk.toLowerCase()];
                    if (su) sH += '<a title="' + sk + '" class="buv-socialLink" href="' + esc(su) + '" target="_blank"><span class="social-link-icon ' + sic + '"></span></a>';
                }
            }

            var vb = ver ? ' <span class="icon-verified buv-altIcon"></span>' : '';
            var btag = ban ? ' <span style="background:#ef4444;color:#fff;font-size:11px;padding:2px 7px;border-radius:4px;font-weight:600;vertical-align:middle;margin-left:6px">BANNED</span>' : '';
            var statusHTML = us ? '<p class="buv-statusMargin buv-status">"' + esc(us) + '"</p>' : '<p class="buv-statusMargin buv-status buv-statusHidden">&emsp;</p>';

            var html = '' +
'<div class="profileContainer-0-2-31" style="overflow:visible!important">' +
'<div style="background:#fef3c7;border:1px solid #f59e0b;color:#92400e;border-radius:6px;padding:8px 14px;margin-bottom:10px;font-size:13px;display:flex;align-items:center;gap:8px"><span style="font-size:16px">⚠️</span><span>This account (<strong>#' + uid + '</strong>) is <strong>' + (ban ? 'banned' : 'deleted') + '</strong>. Profile data recovered via API. Feature by <a href="/users/51543/profile" style="color:#92400e;font-weight:600">cooper</a>.</span></div>' +
'<div class="flex buv-profileHeader" style="overflow:visible!important"><div class="col-12" style="overflow:visible!important"><div class="card buv-card" style="overflow:visible!important"><div class="card-body buv-cardBody" style="overflow:visible!important"><div class="flex" style="overflow:visible!important">' +
'<div class="buv-thumbContainer" style="overflow:visible!important"><div class="buv-headshot"><img alt="' + esc(un) + '" src="' + hu + '"><div class="buv-activity"></div></div><div class="buv-lastOnline">' + (ban ? 'Banned' : 'Deleted') + '</div></div>' +
'<div class="col-12 col-lg-10 ps-0 buv-userInfo">' +
'<h2 class="buv-username">' + esc(un) + vb + btag + '</h2>' +
statusHTML +
'<div class="flex buv-relContainer"><ul class="buv-relList">' +
'<li style="width:25%;float:left;padding:0 5px;text-align:center"><div class="buv-statHeader">Friends</div><a class="buv-statLink" href="/users/' + uid + '/friends#!friends"><h3 class="buv-statText">' + fc + '</h3></a></li>' +
'<li style="width:25%;float:left;padding:0 5px;text-align:center"><div class="buv-statHeader">Followers</div><a class="buv-statLink" href="/users/' + uid + '/friends#!followers"><h3 class="buv-statText">' + foc + '</h3></a></li>' +
'<li style="width:25%;float:left;padding:0 5px;text-align:center"><div class="buv-statHeader">Following</div><a class="buv-statLink" href="/users/' + uid + '/friends#!followings"><h3 class="buv-statText">' + fic + '</h3></a></li>' +
'<li style="width:25%;float:left;padding:0 5px;text-align:center"><div class="buv-statHeader">RAP</div><a class="buv-statLink" href="/internal/collectibles?userId=' + uid + '"><h3 class="buv-statText">' + rap + '</h3></a></li>' +
'</ul></div></div></div></div></div></div></div>' +
'<div><div class="buv-tabBar col-12">' +
'<div class="buv-tab"><p class="buv-tabLabel buv-tabActive" id="buv-tab-about"><span class="buv-tabText">About</span></p></div>' +
'<div class="buv-tab"><p class="buv-tabLabel buv-tabInactive" id="buv-tab-creations"><span class="buv-tabText">Creations</span></p></div>' +
'</div>' +
'<div class="col-12 buv-selected" id="buv-panel-about">' +
'<div class="flex" style="margin-top:8px">' +
'<div class="col-2"><h3 class="buv-header">About</h3></div>' +
'<div class="col-10"><div class="flex justify-content-end" style="margin-bottom:5px">' + sH + '</div></div>' +
'<div class="col-12"><div class="marginStuff buv-card"><p class="buv-aboutBody">' + esc(desc) + '</p>' +
'<div class="divider-top me-4 ms-4"></div>' +
'<div class="flex"><div class="col-6">' + pnH + '</div>' +
'<div class="col-6"><div class="buv-report me-4"><div class="buv-reportWrap"><p class="buv-reportText"><a class="buv-reportLink" href="/abusereport/UserProfile?id=' + uid + '&amp;RedirectUrl=' + encodeURIComponent(location.href) + '"><span class="buv-reportIcon"></span>Report Abuse</a></p></div></div></div>' +
'</div></div></div></div>' +
'<div class="flex marginStuff">' +
'<div class="col-12"><h3 class="buv-header">Currently Wearing</h3></div>' +
'<div class="col-12 col-lg-6 pe-0"><div class="card buv-avatarCard"><div class="buv-avatarWrap"><img src="' + au + '"></div></div></div>' +
'<div class="col-12 col-lg-6 ps-0"><div class="card buv-wearingCard"><div class="flex ps-4 pe-4 pt-4 pb-4">' + wH + '</div></div></div>' +
'</div>' +
'<div class="flex"><div class="col-10"><h3 class="buv-header">Friends (' + fc + ')</h3></div>' +
'<div class="col-2"><div class="buv-seeAllWrap"><a class="buv-seeAll" href="/users/' + uid + '/friends">See All</a></div></div>' +
'<div class="col-12"><div class="marginStuff buv-card"><ul class="buv-friendRow">' + fH + '</ul></div></div></div>' +
(ci.length ? '<div class="flex"><div class="col-10"><h3 class="buv-header">Collections</h3></div><div class="col-2"><div class="buv-seeAllWrap"><a class="buv-seeAll" href="/users/' + uid + '/inventory">Inventory</a></div></div><div class="col-12"><div class="marginStuff buv-card"><div class="flex ps-4 pe-4 pt-4 pb-4">' + cH + '</div></div></div></div>' : '') +
(gl.length ? '<div class="flex marginStuff" style="flex-direction:column"><div class="buv-groupHeaders"><h3 class="buv-header">Groups</h3><div class="col-lg-1" style="margin-left:auto"><a class="buv-toggleBtn" id="buv-grp-slideshow-btn"><div class="buv-btnWrap buv-btnInUse" id="buv-grp-slideshow-wrap"><span class="icon-slideshow"></span></div></a></div><div class="col-lg-1" style="padding-left:0.5em"><a class="buv-toggleBtn" id="buv-grp-grid-btn"><div class="buv-btnWrap buv-btnNotInUse" id="buv-grp-grid-wrap"><span class="icon-grid"></span></div></a></div></div>' + groupsBodyHTML + '</div>' : '') +
'<div class="flex marginStuff"><div class="col-10"><h3 class="buv-header">Favorite Games</h3></div><div class="col-2"><div class="buv-seeAllWrap"><a class="buv-seeAll" href="/users/' + uid + '/favorites">Favorites</a></div></div><div class="col-12">' + gamesContent + '</div></div>' +
kbH +
'<div class="flex"><div class="col-10"><h3 class="buv-header">Badges</h3></div><div class="col-2"><div class="buv-seeAllWrap"><a class="buv-seeAll" href="/users/' + uid + '/inventory">See All</a></div></div><div class="col-12"><div class="marginStuff buv-card"><div class="flex ps-4 pe-4 pt-4 pb-4" style="gap:3px">' + bH + '</div></div></div></div>' +
'<div class="flex"><div class="col-12"><h3 class="buv-header">Statistics</h3></div><div class="col-12"><div class="buv-card"><div class="flex buv-statsPad">' +
'<div class="col-4"><p class="buv-statsLabel">Join Date</p><p class="buv-statsValue">' + jd + '</p></div>' +
'<div class="col-4"><p class="buv-statsLabel">Place Visits</p><p class="buv-statsValue">' + pv + '</p></div>' +
'<div class="col-4"><p class="buv-statsLabel">Status</p><p class="buv-statsValue" style="' + (ban ? 'color:#ef4444' : '') + '">' + (ban ? 'Banned' : 'Deleted') + '</p></div>' +
'</div></div></div></div>' +
'</div>' +
'<div class="col-12" id="buv-panel-creations" style="display:none;margin-top:6px;margin-bottom:6px">' +
'<div class="flex"><div class="col-12"><h3 class="buv-header">Games</h3></div><div class="col-12">' + ugContent + '</div></div>' +
'</div></div></div>';

            var mainEl = document.querySelector('.main-0-2-29');
            if (!mainEl) return;
            var err = mainEl.querySelector('.col-12.h-100');
            if (err) err.remove();
            var cont = mainEl.querySelector('.container-0-2-32');
            if (!cont) {
                cont = document.createElement('div');
                cont.className = 'container-0-2-32 container';
                cont.style.cssText = 'max-width:970px!important;overflow:visible!important';
                var td = mainEl.querySelector('#theme-2016-enabled');
                if (td) td.after(cont); else mainEl.prepend(cont);
            } else {
                cont.innerHTML = '';
            }
            cont.innerHTML = '<div class="row"><div class="col-12"></div></div>' + html;
            document.title = un + "'s Profile - Korone";

            var tabAbout = cont.querySelector('#buv-tab-about');
            var tabCreations = cont.querySelector('#buv-tab-creations');
            var panelAbout = cont.querySelector('#buv-panel-about');
            var panelCreations = cont.querySelector('#buv-panel-creations');
            if (tabAbout && tabCreations) {
                tabCreations.addEventListener('click', function() {
                    panelAbout.style.display = 'none'; panelCreations.style.display = 'block';
                    tabAbout.className = 'buv-tabLabel buv-tabInactive'; tabCreations.className = 'buv-tabLabel buv-tabActive';
                });
                tabAbout.addEventListener('click', function() {
                    panelAbout.style.display = ''; panelCreations.style.display = 'none';
                    tabAbout.className = 'buv-tabLabel buv-tabActive'; tabCreations.className = 'buv-tabLabel buv-tabInactive';
                });
            }

            var slides = cont.querySelectorAll('.buv-groupSlidePair');
            if (slides.length > 1) {
                var cur = 0;
                var showSlide = function(idx) { for (var i = 0; i < slides.length; i++) slides[i].style.display = i === idx ? 'flex' : 'none'; cur = idx; };
                cont.addEventListener('click', function(e) {
                    if (e.target.closest('.buv-grp-back')) showSlide((cur - 1 + slides.length) % slides.length);
                    if (e.target.closest('.buv-grp-fwd')) showSlide((cur + 1) % slides.length);
                });
            }

            var slideshowBtn = cont.querySelector('#buv-grp-slideshow-btn');
            var gridBtn = cont.querySelector('#buv-grp-grid-btn');
            var slideshowWrap = cont.querySelector('#buv-grp-slideshow-wrap');
            var gridWrap = cont.querySelector('#buv-grp-grid-wrap');
            var slideshowDiv = cont.querySelector('#buv-group-slides');
            var gridDiv = cont.querySelector('#buv-groups-grid');
            if (slideshowBtn && gridBtn && slideshowDiv && gridDiv) {
                slideshowBtn.addEventListener('click', function() {
                    slideshowDiv.style.display = 'flex'; gridDiv.style.display = 'none';
                    slideshowWrap.className = 'buv-btnWrap buv-btnInUse'; gridWrap.className = 'buv-btnWrap buv-btnNotInUse';
                });
                gridBtn.addEventListener('click', function() {
                    slideshowDiv.style.display = 'none'; gridDiv.style.display = 'flex'; gridDiv.style.flexWrap = 'wrap';
                    slideshowWrap.className = 'buv-btnWrap buv-btnNotInUse'; gridWrap.className = 'buv-btnWrap buv-btnInUse';
                });
            }
        }

        async function main16() {
            var uid = getUserIdFromURL();
            if (!uid) return;
            await new Promise(function(r) { setTimeout(r, 800); });
            if (!isBannedPage()) return;
            var mainEl = document.querySelector('.main-0-2-29') || document.body;
            var err = mainEl.querySelector('.col-12.h-100');
            var loader = document.createElement('div');
            loader.id = 'buv-loader';
            loader.style.cssText = 'padding:40px;text-align:center;color:var(--text-color-secondary,#888);max-width:970px;margin:0 auto';
            loader.innerHTML = '<div style="font-size:15px">\u23f3 Loading banned user profile\u2026</div>';
            if (err) { err.style.display = 'none'; err.after(loader); } else mainEl.prepend(loader);
            try {
                await render(uid);
            } catch (e) {
                console.error('BUV:', e);
                loader.innerHTML = '<div style="color:#ef4444">\u274c Error: ' + esc(e.message) + '</div>';
                return;
            } finally {
                loader.remove();
                if (err) err.remove();
            }
        }
        main16();
    })();



    // ============================================================
    // #17 — Trade Notifier
    // ============================================================
    (function () {
        if (!extEnabled(17) && !extEnabled(18)) return;

    const BASE = 'https://www.pekora.zip';
    const EP_INBOUND = BASE + '/apisite/trades/v1/trades/inbound';
    const EP_COUNT = BASE + '/apisite/trades/v1/trades/inbound/count';
    const EP_DETAIL = BASE + '/apisite/trades/v1/trades';
    const EP_HEADSHOT = BASE + '/apisite/thumbnails/v1/users/avatar-headshot';
    const EP_ASSET_THUMB = BASE + '/apisite/thumbnails/v1/assets';
    const EP_KOROMONS = 'https://koromons.xyz/api/items';
    const EP_INVENTORY = BASE + '/apisite/inventory/v1/users/{uid}/assets/collectibles';
    const EP_TRADE_SEND = BASE + '/apisite/trades/v1/trades/send';
    const STORE_KEY = 'pekora_seen_trade_ids';
    const SETTINGS_KEY = 'pekora_tn_settings';
    const BLOCKED_KEY = 'pekora_blocked_users';
    const BLACKLIST_ITEMS_KEY = 'pekora_blacklist_items';
    const SPAM_TRACKER_KEY = 'pekora_spam_tracker';
    const TRADE_HISTORY_KEY = 'pekora_trade_history';
    const MAX_STORED = 500;
    const MAX_SELECT = 4;

    const creditsList = [{
        username: 'Simoon67', userId: 9734, role: 'MODIFIER',
        description: 'Youre using my version -- not for the public. Ive modified the extension. Big thanks to @cooper and @david for creating the extension, and @Moist for the item data.',
        profileUrl: BASE + '/users/9734/profile'
    }];

    const defaultSettings = {
        sound: true, desktop: true, toast: true,
        pollInterval: 3000, toastDuration: 10000, toastHoverDelay: 3000,
        spamProtection: true, spamThreshold: 3, spamTimeWindow: 300000, compactMode: false,
        autoDeclineBlacklist: false, autoDeclineBlocked: false
    };

    function loadSettings() { try { const r = localStorage.getItem(SETTINGS_KEY); if (r) return Object.assign({}, defaultSettings, JSON.parse(r)); } catch {} return Object.assign({}, defaultSettings); }
    function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {} }
    function setSetting(k, v) { settings[k] = v; saveSettings(); }
    function loadBlocked() {
        try {
            const raw = JSON.parse(GM_getValue(BLOCKED_KEY, '{}'));
            // Support old format (array of ids) → upgrade to object
            if (Array.isArray(raw)) {
                const obj = {};
                for (const id of raw) obj[id] = { userId: id, username: 'User #' + id };
                return obj;
            }
            return raw;
        } catch { return {}; }
    }
    function saveBlocked() { try { GM_setValue(BLOCKED_KEY, JSON.stringify(blockedUsers)); } catch {} }
    function blockUser(uid, username) { blockedUsers[uid] = { userId: uid, username: username || ('User #' + uid) }; saveBlocked(); if (panelOpen) refreshPanel(); }
    function unblockUser(uid) { delete blockedUsers[uid]; saveBlocked(); if (panelOpen) refreshPanel(); }
    function isBlocked(uid) { return !!blockedUsers[uid]; }
    function loadBlacklist() { try { return new Set(JSON.parse(GM_getValue(BLACKLIST_ITEMS_KEY, '[]'))); } catch { return new Set(); } }
    function saveBlacklist() { try { GM_setValue(BLACKLIST_ITEMS_KEY, JSON.stringify([...blacklistedItems])); } catch {} }
    function blacklistItem(assetId) { blacklistedItems.add(parseInt(assetId)); saveBlacklist(); }
    function unblacklistItem(assetId) { blacklistedItems.delete(parseInt(assetId)); saveBlacklist(); }
    function isBlacklisted(assetId) { return blacklistedItems.has(parseInt(assetId)); }
    function tradeHasBlacklistedItem(det) {
        if (!det || !Array.isArray(det.offers)) return false;
        for (const offer of det.offers) {
            if (offer.userAssets) {
                for (const asset of offer.userAssets) {
                    if (isBlacklisted(asset.assetId)) return true;
                }
            }
        }
        return false;
    }
    function loadSpamTracker() { try { return JSON.parse(GM_getValue(SPAM_TRACKER_KEY, '{}')); } catch { return {}; } }
    function saveSpamTracker() { try { GM_setValue(SPAM_TRACKER_KEY, JSON.stringify(spamTracker)); } catch {} }
    function trackTrade(uid, tid) {
        if (!settings.spamProtection) return false;
        const now = Date.now();
        if (!spamTracker[uid]) spamTracker[uid] = [];
        spamTracker[uid] = spamTracker[uid].filter(e => now - e.timestamp < settings.spamTimeWindow);
        spamTracker[uid].push({ tradeId: tid, timestamp: now });
        if (spamTracker[uid].length >= settings.spamThreshold) return true;
        saveSpamTracker(); return false;
    }
    function loadTradeHistory() { try { return JSON.parse(GM_getValue(TRADE_HISTORY_KEY, '{}')); } catch { return {}; } }
    function saveTradeHistory() { try { GM_setValue(TRADE_HISTORY_KEY, JSON.stringify(tradeHistory)); } catch {} }
    function recordTrade(uid, uname, tid, action, details) {
        if (!tradeHistory[uid]) tradeHistory[uid] = { username: uname, trades: [] };
        tradeHistory[uid].username = uname;
        tradeHistory[uid].trades.unshift({ tradeId: tid, action, timestamp: Date.now(), details });
        if (tradeHistory[uid].trades.length > 20) tradeHistory[uid].trades = tradeHistory[uid].trades.slice(0, 20);
        saveTradeHistory();
    }
    function getUserHistory(uid) { return tradeHistory[uid] || null; }

    let settings = loadSettings(), blockedUsers = loadBlocked(), spamTracker = loadSpamTracker(), blacklistedItems = loadBlacklist();
    let tradeHistory = loadTradeHistory(), koromonsItems = {}, seen = loadSeen(), first = true;
    let panelOpen = false, panelTrades = [], panelDetails = {}, panelHeads = {};
    let assetThumbs = {}, csrfToken = null, pollTimer = null, creditsHeads = {};

    function playSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            function beep(f, s, d, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(v, ctx.currentTime + s); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + d); o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + s); o.stop(ctx.currentTime + s + d); }
            beep(880, 0, 0.15, 0.3); beep(1100, 0.12, 0.15, 0.25); beep(1320, 0.24, 0.2, 0.2);
        } catch {}
    }
    function esc(s) { const d = document.createElement('div'); d.textContent = String(s != null ? s : ''); return d.innerHTML; }
    function loadSeen() { try { return new Set(JSON.parse(GM_getValue(STORE_KEY, '[]'))); } catch { return new Set(); } }
    function saveSeen(s) { let a = [...s]; if (a.length > MAX_STORED) a = a.slice(a.length - MAX_STORED); GM_setValue(STORE_KEY, JSON.stringify(a)); }
    function extractCsrf(h) { if (!h) return; const m = h.match(/x-csrf-token:\s*([^\r\n]+)/i); if (m) csrfToken = m[1].trim(); }

    function apiGet(url, creds) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET', url, headers: { Accept: 'application/json' }, withCredentials: !!creds,
                onload(r) { extractCsrf(r.responseHeaders); if (r.status >= 200 && r.status < 300) { try { resolve(JSON.parse(r.responseText)); } catch { reject(new Error('parse')); } } else reject(new Error('HTTP ' + r.status)); },
                onerror(e) { reject(e); }
            });
        });
    }

    function apiPost(url, body, attempt) {
        attempt = attempt || 0;
        return new Promise((resolve, reject) => {
            const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
            if (csrfToken) headers['x-csrf-token'] = csrfToken;
            GM_xmlhttpRequest({
                method: 'POST', url, headers, withCredentials: true,
                data: typeof body === 'string' ? body : JSON.stringify(body || {}),
                onload(r) {
                    extractCsrf(r.responseHeaders);
                    if (r.status === 403 && attempt < 3) return apiPost(url, body, attempt + 1).then(resolve).catch(reject);
                    if (r.status >= 200 && r.status < 300) { try { resolve(JSON.parse(r.responseText || '{}')); } catch { resolve({}); } }
                    else { let msg = 'HTTP ' + r.status; try { const j = JSON.parse(r.responseText); if (j.errors && j.errors[0]) msg = j.errors[0].message; } catch {} reject(new Error(msg)); }
                },
                onerror(e) { reject(e); }
            });
        });
    }

    async function seedCsrf() { try { await apiPost(BASE + '/apisite/trades/v1/trades/0/accept', {}); } catch {} }
    async function fetchKoromons() {
        try {
            const j = await apiGet(EP_KOROMONS, false);
            if (Array.isArray(j)) {
                const m = {};
                let zeroCount = 0;
                let nonZeroCount = 0;
                for (const it of j) {
                    // Koromons uses itemId as the catalog ID
                    const itemId = it.itemId || it.assetId;
                    if (itemId) {
                        // Get value - Koromons only has Value field, no RAP
                        const value = it.Value || it.value || 0;

                        if (value === 0) zeroCount++;
                        else nonZeroCount++;

                        const itemData = {
                            assetId: itemId,
                            name: it.Name || it.name,
                            value: value,
                            rap: value, // Koromons doesn't have RAP, use Value as RAP
                            demand: it.Demand || it.demand,
                            trend: it.Trend || it.trend
                        };

                        // Store by itemId for lookups
                        m[itemId] = itemData;
                    }
                }
                koromonsItems = m;

                // Log a sample item to see structure
                const sampleKey = Object.keys(m)[0];
                            }
        } catch (err) {
                    }
    }
    async function fetchInbound() {
        const all = []; let cursor = '';
        // Fetch standard inbound trades
        while (true) { const j = await apiGet(EP_INBOUND + '?cursor=' + encodeURIComponent(cursor), true); if (Array.isArray(j.data)) all.push(...j.data); if (j.nextPageCursor) cursor = j.nextPageCursor; else break; }
        // Also fetch countered trades (they come back as inbound with status Countered,
        // but some API versions return them under outbound — merge both to be safe)
        try {
            let c2 = '';
            while (true) {
                const j2 = await apiGet(BASE + '/apisite/trades/v1/trades/inbound?tradeStatusType=Countered&cursor=' + encodeURIComponent(c2), true);
                if (Array.isArray(j2.data)) {
                    for (const t of j2.data) { if (!all.find(x => x.id === t.id)) all.push(t); }
                }
                if (j2.nextPageCursor) c2 = j2.nextPageCursor; else break;
            }
        } catch {}
        return all;
    }
    async function fetchCount() { try { return (await apiGet(EP_COUNT, true)).count || 0; } catch { return 0; } }
    async function fetchDetail(id) { return await apiGet(EP_DETAIL + '/' + id, true); }
    async function fetchHeads(ids) {
        if (!ids.length) return {};
        const m = {};
        for (let i = 0; i < ids.length; i += 25) {
            const chunk = ids.slice(i, i + 25);
            try { const j = await apiGet(EP_HEADSHOT + '?userIds=' + chunk.join(',') + '&size=420x420&format=png', true); if (Array.isArray(j.data)) for (const e of j.data) if (e.state === 'Completed' && e.imageUrl) m[e.targetId] = e.imageUrl.startsWith('http') ? e.imageUrl : BASE + e.imageUrl; } catch {}
        }
        return m;
    }
    async function fetchAssetThumbs(assetIds) {
        if (!assetIds.length) return {};
        const m = {}, needed = assetIds.filter(id => !assetThumbs[id]);
        for (let i = 0; i < needed.length; i += 30) {
            const chunk = needed.slice(i, i + 30);
            try { const j = await apiGet(EP_ASSET_THUMB + '?assetIds=' + chunk.join(',') + '&format=png&size=420x420', true); if (Array.isArray(j.data)) for (const e of j.data) if (e.state === 'Completed' && e.imageUrl) { const url = e.imageUrl.startsWith('http') ? e.imageUrl : BASE + e.imageUrl; assetThumbs[e.targetId] = url; m[e.targetId] = url; } } catch {}
        }
        for (const id of assetIds) if (assetThumbs[id]) m[id] = assetThumbs[id];
        return m;
    }
    async function fetchInventory(uid) {
        const all = []; let cursor = '';
        while (true) {
            const q = new URLSearchParams({ limit: '100', assetType: 'null' });
            if (cursor) q.set('cursor', cursor);
            try {
                const j = await apiGet(EP_INVENTORY.replace('{uid}', uid) + '?' + q, true);
                all.push(...(j.data || []));
                if (j.nextPageCursor) cursor = j.nextPageCursor; else break;
            } catch { break; }
        }
        return all;
    }

    function collectAssetIds(det) {
        const ids = [];
        if (det && Array.isArray(det.offers)) for (const o of det.offers) if (o.userAssets) for (const a of o.userAssets) if (a.assetId && ids.indexOf(a.assetId) === -1) ids.push(a.assetId);
        return ids;
    }
    async function fetchCreditsHeads() { creditsHeads = await fetchHeads(creditsList.map(c => c.userId)); }
    function ago(d) { const df = Date.now() - new Date(d); if (df < 0) return 'just now'; const s = Math.floor(df / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), dy = Math.floor(h / 24); if (dy > 0) return dy + 'd ago'; if (h > 0) return h + 'h ago'; if (m > 0) return m + 'm ago'; return s + 's ago'; }
    function until(d) { const df = new Date(d) - Date.now(); if (df <= 0) return 'Expired'; const m = Math.floor(df / 60000), h = Math.floor(m / 60), dy = Math.floor(h / 24); if (dy > 0) return dy + 'd ' + (h % 24) + 'h'; if (h > 0) return h + 'h ' + (m % 60) + 'm'; return m + 'm'; }
    function getKoromons(id) { return koromonsItems[id] || null; }
    function splitOffers(det, sid) {
        if (!det || !Array.isArray(det.offers)) return { sending: null, receiving: null };
        let sending = null, receiving = null;
        for (const o of det.offers) { if (!o.user) continue; if (o.user.id === sid) sending = o; else receiving = o; }
        return { sending, receiving };
    }
    function offerTotals(offer) {
        let tv = 0, tr = 0, robux = 0;
        if (offer && offer.userAssets) for (const a of offer.userAssets) { const k = getKoromons(a.assetId); if (k) { tv += k.value || 0; tr += k.rap || 0; } else if (a.recentAveragePrice != null) tr += a.recentAveragePrice; }
        if (offer && offer.robux > 0) robux = offer.robux;
        return { tv, tr, robux };
    }
    function summaryText(det, sid) {
        const { sending, receiving } = splitOffers(det, sid);
        const sv = offerTotals(sending), rv = offerTotals(receiving);
        let s = 'Giving ' + (sending?.userAssets?.length || 0) + ' items';
        if (sv.tv > 0) s += ' (Value: ' + sv.tv.toLocaleString() + ')';
        s += ' | Getting ' + (receiving?.userAssets?.length || 0) + ' items';
        if (rv.tv > 0) s += ' (Value: ' + rv.tv.toLocaleString() + ')';
        return s;
    }
    function demandColor(d) { if (!d) return '#888'; const l = d.toLowerCase(); if (l==='amazing') return '#4fc3f7'; if (l==='great') return '#66bb6a'; if (l==='good'||l==='normal') return '#e8c44a'; if (l==='low') return '#e07843'; if (l==='terrible') return '#ef5350'; return '#888'; }
    function demandBg(d) { if (!d) return 'rgba(136,136,136,.1)'; const l = d.toLowerCase(); if (l==='amazing') return 'rgba(79,195,247,.1)'; if (l==='great') return 'rgba(102,187,106,.1)'; if (l==='good'||l==='normal') return 'rgba(232,196,74,.1)'; if (l==='low') return 'rgba(224,120,67,.1)'; if (l==='terrible') return 'rgba(239,83,80,.1)'; return 'rgba(136,136,136,.1)'; }

    const ITEM_FB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23222' width='1' height='1'/%3E%3C/svg%3E";

    function offerHtml(offer, compact) {
        if (!offer) return '<span class="te">Nothing</span>';
        const robuxIconImg = TM_IMG_ROBUX ? '<img src="'+TM_IMG_ROBUX+'" style="width:32px;height:32px;object-fit:contain">' : '<span style="font-size:20px;font-weight:900;color:#00e87e">R$</span>';
        const robuxIconSmall = TM_IMG_ROBUX ? '<img src="'+TM_IMG_ROBUX+'" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:2px">' : 'R$';
        if (compact) {
            const p = [];
            if (offer.userAssets) for (const a of offer.userAssets) { const n = esc(a.name || 'Asset ' + a.assetId); const thumb = assetThumbs[a.assetId] || ITEM_FB; p.push('<div class="ta ta-compact"><img src="' + thumb + '" class="ta-img-compact"><div class="ta-body-compact"><span class="ta-n-compact">' + n + '</span></div></div>'); }
            if (offer.robux > 0) p.push('<div class="ta ta-compact ta-robux"><div class="ta-robux-icon-compact" style="background:transparent">'+robuxIconImg+'</div><div class="ta-body-compact"><span class="ta-n-compact trx" style="color:#00e87e">' + offer.robux.toLocaleString() + '</span></div></div>');
            return p.length ? p.join('') : '<span class="te">Nothing</span>';
        }
        let html = '<div class="items-grid">';
        if (offer.userAssets) for (const a of offer.userAssets) {
            const thumb = assetThumbs[a.assetId] || ITEM_FB;
            const k = getKoromons(a.assetId);
            const name = esc(a.name || 'Asset ' + a.assetId);
            let tags = '';
            if (k) { if (k.value) tags += '<span class="grid-tag">' + (k.value||0).toLocaleString() + '</span>'; if (k.rap) tags += '<span class="grid-tag">' + (k.rap||0).toLocaleString() + '</span>'; }
            else if (a.recentAveragePrice != null) tags += '<span class="grid-tag">' + a.recentAveragePrice.toLocaleString() + '</span>';
            html += '<div class="grid-item"><div class="grid-item-img-wrapper"><img src="' + thumb + '" onerror="this.src=\'' + ITEM_FB + '\'" class="grid-item-img"></div><div class="grid-item-name" title="' + name + '">' + name + '</div>' + (tags ? '<div class="grid-item-tags">' + tags + '</div>' : '') + '</div>';
        }
        if (offer.robux > 0) html += '<div class="grid-item grid-item-robux"><div class="grid-item-img-wrapper"><div class="grid-robux-icon" style="display:flex;align-items:center;justify-content:center">'+robuxIconImg+'</div></div><div class="grid-item-name" style="color:#00e87e">Robux Offered</div><div class="grid-item-tags"><span class="grid-tag" style="color:#00e87e;background:rgba(0,232,126,0.1)">'+offer.robux.toLocaleString()+'</span></div></div>';
        html += '</div>';
        const v = offerTotals(offer);
        let tot = '<div class="ts-grid">';
        if (v.tv > 0) tot += '<span class="tt tt-v">Total Value ' + v.tv.toLocaleString() + '</span>';
        if (v.tr > 0) tot += '<span class="tt tt-r">Total RAP ' + v.tr.toLocaleString() + '</span>';
        if (v.robux > 0) tot += '<span class="tt trx-t" style="color:#00e87e;display:inline-flex;align-items:center;gap:3px">'+robuxIconSmall+' Robux Offered: ' + v.robux.toLocaleString() + '</span>';
        tot += '</div>';
        return html + tot;
    }

    function diffTag(diff, label) {
        if (diff === 0) return '<span class="dt dt-e">' + label + ' Even</span>';
        return '<span class="dt ' + (diff > 0 ? 'dt-w' : 'dt-l') + '">' + label + ' ' + (diff > 0 ? '+' : '') + diff.toLocaleString() + '</span>';
    }
    function summaryHtml(det, sid, compact) {
        const { sending, receiving } = splitOffers(det, sid);
        const sv = offerTotals(sending), rv = offerTotals(receiving);
        if (compact) {
            const vd = sv.tv - rv.tv, rd = sv.tr - rv.tr;
            let st = '';
            if (vd > 100) st = '<span class="sum-compact-win">+' + vd.toLocaleString() + ' Value</span>';
            else if (vd < -100) st = '<span class="sum-compact-loss">' + vd.toLocaleString() + ' Value</span>';
            else if (rd > 100) st = '<span class="sum-compact-win">+' + rd.toLocaleString() + ' RAP</span>';
            else if (rd < -100) st = '<span class="sum-compact-loss">' + rd.toLocaleString() + ' RAP</span>';
            else st = '<span class="sum-compact-even">Even Trade</span>';
            return '<div class="sum-compact">' + st + '</div>';
        }
        let s = '<div class="sum-diffs-only">';
        if (sv.tv > 0 || rv.tv > 0) s += diffTag(sv.tv - rv.tv, 'Value');
        if (sv.tr > 0 || rv.tr > 0) s += diffTag(sv.tr - rv.tr, 'RAP');
        s += '</div>';
        return s;
    }

    function actionsHtml(tid, uid, prefix) {
        return '<div class="' + prefix + '-acts">' +
            '<button class="ab ab-a" data-a="accept" data-t="' + tid + '">Accept</button>' +
            '<button class="ab ab-c" data-a="counter" data-t="' + tid + '" data-u="' + uid + '">Counter</button>' +
            '<button class="ab ab-d" data-a="decline" data-t="' + tid + '">Decline</button>' +
            '<button class="ab ab-b" data-a="block" data-t="' + tid + '" data-u="' + uid + '">Block</button>' +
            '<a class="ab ab-i" href="' + BASE + '/My/Trades.aspx" target="_blank">Details</a>' +
            '</div>';
    }

    function bindActions(root) {
        root.querySelectorAll('.ab[data-a]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); handleAction(b); }));
        root.querySelectorAll('.tp-warning-icon').forEach(icon => icon.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); if (icon.dataset.warning) alert(icon.dataset.warning); }));
        root.querySelectorAll('.tp-history-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); showUserHistory(parseInt(btn.dataset.uid), btn.dataset.username); }));
    }

    function showConfirm(msg, onYes) {
        const old = document.getElementById('tc'); if (old) old.remove();
        const overlay = document.createElement('div');
        overlay.id = 'tc';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0);z-index:999999999;display:flex;align-items:center;justify-content:center;transition:background .25s ease';

        overlay.innerHTML = '<div id="tc-box" style="background:#2b2d2f;border-radius:0;padding:24px;max-width:600px;box-shadow:0 8px 32px rgba(0,0,0,.6);transform:scale(0.8) translateY(-20px);opacity:0;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1)"><div style="font-size:16px;font-weight:700;color:#e8c44a;margin-bottom:12px">⚠ Warning</div><div style="font-size:14px;color:#b8b8b8;line-height:1.6;margin-bottom:20px;white-space:pre-line">' + esc(msg) + '</div><div style="display:flex;gap:10px"><button id="tc-confirm" style="flex:1;padding:10px;background:#0074bd;border:none;border-radius:0;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s">Confirm</button><button id="tc-cancel" style="flex:1;padding:10px;background:#2b2d2f;border:1px solid #393b3d;border-radius:0;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s">Cancel</button></div></div>';

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.background = 'rgba(0,0,0,.8)';
            const box = document.getElementById('tc-box');
            if (box) {
                box.style.transform = 'scale(1) translateY(0)';
                box.style.opacity = '1';
            }
        });

        overlay.querySelector('#tc-cancel').addEventListener('click', () => overlay.remove());
        overlay.querySelector('#tc-confirm').addEventListener('click', () => { overlay.remove(); onYes(); });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    function setStatus(btn, cls, text) { const acts = btn.closest('[class$="-acts"]'); if (!acts) return; acts.innerHTML = '<span class="as ' + cls + '">' + text + '</span>'; }

    async function doAccept(btn, tid) {
        setStatus(btn, 'as-w', 'Accepting...');
        try { await apiPost(EP_DETAIL + '/' + tid + '/accept', {}); setStatus(btn, 'as-ok', '\u2713 Accepted'); const t = panelTrades.find(t => t.id === tid); if (t) recordTrade(t.user.id, t.user.displayName, tid, 'accepted', 'Accepted'); setTimeout(refreshPanel, 1200); }
        catch (e) { setStatus(btn, 'as-er', '\u2717 ' + e.message); }
    }
    async function doDecline(btn, tid) {
        setStatus(btn, 'as-w', 'Declining...');
        try { await apiPost(EP_DETAIL + '/' + tid + '/decline', {}); setStatus(btn, 'as-ok', '\u2713 Declined'); const t = panelTrades.find(t => t.id === tid); if (t) recordTrade(t.user.id, t.user.displayName, tid, 'declined', 'Declined'); setTimeout(refreshPanel, 1200); }
        catch (e) { setStatus(btn, 'as-er', '\u2717 ' + e.message); }
    }
    async function doBlock(btn, tid, uid) {
        setStatus(btn, 'as-w', 'Blocking...');
        try {
            await apiPost(EP_DETAIL + '/' + tid + '/decline', {});
            const trade = panelTrades.find(t => t.id === tid);
            const username = trade ? trade.user.displayName : ('User #' + uid);
            blockUser(uid, username);
            setStatus(btn, 'as-ok', '\u2713 Blocked');
            setTimeout(refreshPanel, 1200);
        }
        catch (e) { setStatus(btn, 'as-er', '\u2717 ' + e.message); }
    }

    function handleAction(btn) {
        const a = btn.dataset.a, tid = parseInt(btn.dataset.t), uid = parseInt(btn.dataset.u);
        if (a === 'accept') {
            const det = panelDetails[tid], trade = panelTrades.find(t => t.id === tid);
            const username = trade ? trade.user.displayName : 'this user';
            if (det && trade) {
                const { sending, receiving } = splitOffers(det, trade.user.id);
                const sv = offerTotals(sending), rv = offerTotals(receiving);
                if (sv.tv - rv.tv < -1000 || sv.tr - rv.tr < -1000) {
                    showConfirm('WARNING: Big loss trade!\nAccept from ' + username + '?', () => doAccept(btn, tid)); return;
                }
            }
            showConfirm('Accept trade from ' + username + '?', () => doAccept(btn, tid));
        } else if (a === 'decline') {
            const trade = panelTrades.find(t => t.id === tid);
            showConfirm('Decline trade from ' + (trade ? trade.user.displayName : 'this user') + '?', () => doDecline(btn, tid));
        } else if (a === 'block') {
            const trade = panelTrades.find(t => t.id === tid);
            showConfirm('Block ' + (trade ? trade.user.displayName : 'user') + '?', () => doBlock(btn, tid, uid));
        } else if (a === 'counter') window.open(BASE + '/Trade/TradeWindow.aspx?TradeSessionId=' + tid + '&TradePartnerID=' + uid, '_blank');
    }

    function showUserHistory(uid, username) {
        const history = getUserHistory(uid), old = document.getElementById('history-panel'); if (old) old.remove();
        const ov = document.createElement('div'); ov.id = 'history-ov'; ov.addEventListener('click', closeHistoryPanel); document.body.appendChild(ov);
        let html = '';
        if (history && history.trades.length > 0) {
            for (const trade of history.trades) {
                const ac = trade.action === 'declined' ? 'hist-declined' : trade.action === 'blocked' ? 'hist-blocked' : 'hist-accepted';
                const at = trade.action === 'declined' ? 'Declined' : trade.action === 'blocked' ? 'Blocked' : 'Accepted';
                html += '<div class="hist-item"><div class="hist-header"><span class="' + ac + '">' + at + '</span><span class="hist-time">' + ago(trade.timestamp) + '</span></div><div class="hist-id">Trade #' + trade.tradeId + '</div><div class="hist-details">' + esc(trade.details) + '</div></div>';
            }
        } else html = '<div class="hist-empty">No trade history with this user</div>';
        const panel = document.createElement('div'); panel.id = 'history-panel';
        panel.innerHTML = '<div class="hist-h"><span class="hist-title">Trade History: ' + esc(username) + '</span><span class="hist-x">\u2715</span></div><div class="hist-body">' + html + '</div>';
        document.body.appendChild(panel); panel.querySelector('.hist-x').addEventListener('click', closeHistoryPanel);
    }
    function closeHistoryPanel() { const p = document.getElementById('history-panel'); if (p) p.remove(); const o = document.getElementById('history-ov'); if (o) o.remove(); }

    // ===
    // MASS TRADE SENDER

    async function getMyUserId() {
        if (massState.myUserId) return massState.myUserId;
        try {
            const j = await apiGet(BASE + '/apisite/users/v1/users/authenticated', true);
            if (j && j.id) { massState.myUserId = j.id; return j.id; }
        } catch {}
        const m = document.cookie.match(/userid=(\d+)/i);
        if (m) { massState.myUserId = parseInt(m[1]); return massState.myUserId; }
        return null;
    }

    async function resolveUserId(raw) {
        raw = raw.trim();
        if (/^\d+$/.test(raw)) return parseInt(raw);
        const j = await apiPost(BASE + '/apisite/users/v1/usernames/users', JSON.stringify({ usernames: [raw], excludeBannedUsers: false }));
        const data = (j && j.data) || [];
        if (!data.length) throw new Error('User not found: ' + raw);
        return data[0].id;
    }

    async function findUserItem(userId, assetId) {
        // Search user inventory for a specific assetId, return userAssetId if found
        let cursor = '';
        for (let page = 0; page < 20; page++) {
            const q = new URLSearchParams({ limit: '100', assetType: 'null' });
            if (cursor) q.set('cursor', cursor);
            const j = await apiGet(EP_INVENTORY.replace('{uid}', userId) + '?' + q, true);
            for (const item of (j.data || [])) {
                if (item.assetId === assetId) return item;
            }
            if (j.nextPageCursor) cursor = j.nextPageCursor; else break;
        }
        return null;
    }
    async function fetchAssetOwners(assetId) {
        const owners = [];
        let cursor = '';
        let pages = 0;

        // Try v2 endpoint first
        while (pages < 50) {
            pages++;
            let url = BASE + '/apisite/inventory/v2/assets/' + assetId + '/owners?limit=100';
            if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
            try {
                const j = await apiGet(url, true);
                console.log('[fetchAssetOwners] Response:', j);

                // Check different possible data structures
                const items = j.data || j.items || (Array.isArray(j) ? j : []);

                for (const e of items) {
                    // Try different property names
                    const owner = e.owner || e.user || e;
                    const ownerId = owner.id || owner.userId || owner.Id;
                    const ownerName = owner.displayName || owner.name || owner.username || ('User #' + ownerId);
                    const assetIdFromItem = e.userAssetId || e.id || e.assetId;

                    if (ownerId && assetIdFromItem) {
                        owners.push({
                            userId: ownerId,
                            username: ownerName,
                            userAssetId: assetIdFromItem
                        });
                    }
                }

                if (j.nextPageCursor || j.nextCursor) cursor = j.nextPageCursor || j.nextCursor;
                else break;
            } catch (e) {
                console.error('[fetchAssetOwners] Error:', e);
                break;
            }
        }

        console.log('[fetchAssetOwners] Found ' + owners.length + ' owners');
        return owners;
    }

    function updateMassTradeTotal() {
        const rapEl = document.getElementById('mt-total-rap');
        const valueEl = document.getElementById('mt-total-value');
        if (!rapEl || !valueEl) return;

        let totalRap = 0;
        let totalValue = 0;

        console.log('Calculating totals for', blastState.mySelected.length, 'selected items');
        for (const item of blastState.mySelected) {
            const rap = item.recentAveragePrice || 0;
            const value = assetValues[item.assetId] || 0;
            console.log('Item', item.name || item.assetId, '- RAP:', rap, 'Value:', value);
            totalRap += rap;
            totalValue += value;
        }

        console.log('Total RAP:', totalRap, 'Total Value:', totalValue);
        rapEl.textContent = totalRap.toLocaleString();
        valueEl.textContent = totalValue.toLocaleString();
    }

    function showMassTradePanel() {
        if (!extEnabled(18)) return;
        const old = document.getElementById('mass-trade-ov');
        if (old) { old.remove(); document.getElementById('mass-trade-panel')?.remove(); return; }
        injectCss();

        const ov = document.createElement('div');
        ov.id = 'mass-trade-ov';
        ov.addEventListener('click', e => { if (e.target === ov) closeMassTradePanel(); });
        document.body.appendChild(ov);

        const panel = document.createElement('div');
        panel.id = 'mass-trade-panel';
        panel.innerHTML =
            '<div class="mt-h">' +
                '<div class="mt-hl"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg><span class="mt-title">Mass Trade Sender</span></div>' +
                '<span class="mt-x">&#10005;</span>' +
            '</div>' +

            // Tabs
            '<div class="mt-tabs">' +
                '<button class="mt-tab mt-tab-active" id="mt-tab-blast">Blast All Owners</button>' +
                '<button class="mt-tab" id="mt-tab-custom">Custom Multi-Send</button>' +
            '</div>' +

            // Tab content containers
            '<div class="mt-body">' +
                '<div id="mt-mode-blast" class="mt-mode-content">' +
                    '<div class="mt-warn-banner">⚠ ABUSING THIS MAY RESULT IN A BAN. ANY ACTIONS YOU TAKE ARE NOT OUR FAULT.</div>' +

                    '<div class="mt-step">' +
                        '<div class="mt-step-label">1. Your Items to Offer <span class="mt-count" id="mt-blast-my-count">(0/4)</span></div>' +
                        '<button class="mt-btn mt-btn-blue mt-fullw" id="mt-blast-load-inv">Load My Inventory</button>' +
                        '<div id="mt-blast-my-items" class="mt-items-grid-wrap" style="margin-top:10px"><div class="mt-placeholder">Click above to load</div></div>' +
                    '</div>' +

                    '<div class="mt-step">' +
                        '<div class="mt-step-label">2. Target Item (Click to Select)</div>' +
                        '<div class="mt-row">' +
                            '<input id="mt-blast-asset-input" class="mt-input" placeholder="Filter items by name...">' +
                        '</div>' +
                        '<div id="mt-blast-target-grid" style="margin-top:10px;max-height:300px;overflow-y:auto;background:#111;border-radius:6px;border:1px solid #2b2d2f;padding:8px">' +
                            '<div style="padding:20px;color:#b8b8b8;text-align:center">Loading collectibles...</div>' +
                        '</div>' +
                        '<div id="mt-blast-selected-item" style="display:none;margin-top:10px;padding:10px;background:#111;border-radius:6px;border:1px solid #2b2d2f">' +
                            '<div style="display:flex;align-items:center;gap:10px">' +
                                '<img id="mt-blast-selected-thumb" style="width:60px;height:60px;border-radius:6px;background:#1a1a1a;object-fit:contain">' +
                                '<div style="flex:1">' +
                                    '<div id="mt-blast-selected-name" style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px"></div>' +
                                    '<div id="mt-blast-owner-count" style="font-size:12px;color:#b8b8b8"></div>' +
                                '</div>' +
                                '<button class="mt-btn mt-btn-blue" id="mt-blast-find-owners">Find Owners</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="mt-step">' +
                        '<div class="mt-step-label">3. Blast Trades</div>' +
                        '<div style="margin:10px 0;font-size:12px;color:#b8b8b8">' +
                            'Selected: <span id="mt-total-rap" style="color:#4fc3f7;font-weight:700">0</span> RAP, ' +
                            '<span id="mt-total-value" style="color:#4fc3f7;font-weight:700">0</span> Value' +
                        '</div>' +
                        '<div id="mt-blast-summary" style="display:none;background:#111;border:1px solid #2b2d2f;border-radius:6px;padding:12px;margin-bottom:10px;font-size:12px;color:#b8b8b8"></div>' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                            '<div style="display:flex;align-items:center;gap:8px">' +
                                '<label style="font-size:11px;color:#b8b8b8;font-weight:600">Max users:</label>' +
                                '<button class="mt-small-btn" id="mt-max-dec">−</button>' +
                                '<span id="mt-max-display" style="font-size:12px;font-weight:700;color:#fff;min-width:60px;text-align:center">All</span>' +
                                '<button class="mt-small-btn" id="mt-max-inc">+</button>' +
                                '<button class="mt-max-btn" id="mt-max-all">Max Copies</button>' +
                            '</div>' +
                            '<div style="display:flex;align-items:center;gap:8px">' +
                                '<label style="font-size:11px;color:#b8b8b8;font-weight:600">Delay:</label>' +
                                '<button class="mt-small-btn" id="mt-delay-dec">−</button>' +
                                '<span id="mt-delay-display" style="font-size:12px;font-weight:700;color:#fff;min-width:70px;text-align:center">20 sec</span>' +
                                '<button class="mt-small-btn" id="mt-delay-inc">+</button>' +
                            '</div>' +
                        '</div>' +
                        '<div style="display:flex;gap:8px">' +
                            '<button class="mt-btn mt-btn-green mt-fullw" id="mt-blast-btn" disabled>Send All Trades</button>' +
                            '<button class="mt-btn" id="mt-blast-stop-btn" style="display:none;background:#ff4444;color:#fff">Stop</button>' +
                        '</div>' +
                        '<div id="mt-blast-progress" style="display:none;height:6px;background:#111;border-radius:3px;overflow:hidden;margin-top:8px"><div id="mt-blast-progress-bar" style="height:100%;background:linear-gradient(90deg,#0074bd,#4fc3f7);border-radius:3px;transition:width .3s;width:0%"></div></div>' +
                        '<div id="mt-blast-log" class="mt-log" style="margin-top:10px"></div>' +
                    '</div>' +

                    '<div class="mt-how-wrap">' +
                        '<button class="mt-how-toggle" id="mt-blast-how-toggle">? How to use</button>' +
                        '<div class="mt-how-box" id="mt-blast-how-box" style="display:none">' +
                            '<div class="mt-how-title">Blast All Owners Mode</div>' +
                            '<div class="mt-how-step"><span class="mt-how-num">1</span>Load your inventory and select up to 4 items to offer.</div>' +
                            '<div class="mt-how-step"><span class="mt-how-num">2</span>Enter the <b>asset ID</b> of the item you want. The script will find all owners.</div>' +
                            '<div class="mt-how-step"><span class="mt-how-num">3</span>Click <b>Send All Trades</b> to blast the same trade offer to every owner.</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                '<div id="mt-mode-custom" class="mt-mode-content" style="display:none">' +
                    '<div class="mt-warn-banner">⚠ ABUSING THIS MAY RESULT IN A BAN. ANY ACTIONS YOU TAKE ARE NOT OUR FAULT.</div>' +

                    '<div class="mt-step">' +
                        '<div class="mt-step-label">1. Your Items to Offer <span class="mt-count" id="mt-my-count">(0/4)</span></div>' +
                        '<button class="mt-btn mt-btn-blue mt-fullw" id="mt-load-inv">Load My Inventory</button>' +
                        '<div id="mt-my-items" class="mt-items-grid-wrap" style="margin-top:10px"><div class="mt-placeholder">Click above to load</div></div>' +
                    '</div>' +

                    '<div class="mt-step">' +
                        '<div class="mt-step-label">2. Users &amp; Item to Request</div>' +
                        '<div class="mt-row" style="margin-bottom:8px">' +
                            '<input id="mt-user-input" class="mt-input" placeholder="Username or user ID...">' +
                            '<input id="mt-asset-input" class="mt-input" placeholder="Asset ID they have...">' +
                            '<button class="mt-btn mt-btn-blue" id="mt-add-target">Add</button>' +
                        '</div>' +
                        '<div id="mt-targets-list" class="mt-targets-list"><div class="mt-placeholder">No users added yet</div></div>' +
                    '</div>' +

                    '<div class="mt-step">' +
                        '<div class="mt-step-label">3. Send All Trades</div>' +
                        '<button class="mt-btn mt-btn-green mt-fullw mt-send-btn" id="mt-send-all" disabled>Send All Trades</button>' +
                        '<div id="mt-log" class="mt-log" style="margin-top:10px"></div>' +
                    '</div>' +

                    '<div class="mt-how-wrap">' +
                        '<button class="mt-how-toggle" id="mt-how-toggle">? How to use</button>' +
                        '<div class="mt-how-box" id="mt-how-box" style="display:none">' +
                            '<div class="mt-how-title">Custom Multi-Send Mode</div>' +
                            '<div class="mt-how-step"><span class="mt-how-num">1</span>Load your inventory and select up to 4 items to offer in every trade.</div>' +
                            '<div class="mt-how-step"><span class="mt-how-num">2</span>For each person, enter their <b>username or ID</b> and the <b>asset ID</b> you want from them, then click <b>Add</b>.</div>' +
                            '<div class="mt-how-step"><span class="mt-how-num">3</span>Green checkmark = they have it. "No item found" = they don\'t.</div>' +
                            '<div class="mt-how-step"><span class="mt-how-num">4</span>Click <b>Send All Trades</b> to send all ready trades at once.</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(panel);
        panel.querySelector('.mt-x').addEventListener('click', closeMassTradePanel);

        // Tab switching
        panel.querySelector('#mt-tab-blast').addEventListener('click', () => switchMassTradeTab('blast'));
        panel.querySelector('#mt-tab-custom').addEventListener('click', () => switchMassTradeTab('custom'));

        // Initialize blast mode handlers
        initBlastMode(panel);
        restoreLogs('blast');

        // Initialize custom mode handlers
        initCustomMode(panel);
        restoreLogs('custom');
    }

    function switchMassTradeTab(mode) {
        document.querySelectorAll('.mt-tab').forEach(t => t.classList.remove('mt-tab-active'));
        document.querySelectorAll('.mt-mode-content').forEach(c => c.style.display = 'none');

        if (mode === 'blast') {
            document.getElementById('mt-tab-blast').classList.add('mt-tab-active');
            document.getElementById('mt-mode-blast').style.display = 'block';
        } else {
            document.getElementById('mt-tab-custom').classList.add('mt-tab-active');
            document.getElementById('mt-mode-custom').style.display = 'block';
        }
    }

    // Blast mode state & handlers
    let blastState = { myItems: [], mySelected: [], targetAssetId: null, targetOwners: [], sending: false, stopped: false, maxSendCount: null, logs: [], delaySeconds: 20 };

    function initBlastMode(panel) {
        // How-to toggle
        panel.querySelector('#mt-blast-how-toggle').addEventListener('click', () => {
            const box = document.getElementById('mt-blast-how-box');
            const btn = document.getElementById('mt-blast-how-toggle');
            const open = box.style.display === 'none';
            box.style.display = open ? 'block' : 'none';
            btn.textContent = open ? '▲ Hide instructions' : '? How to use';
        });

        // Load inventory
        panel.querySelector('#mt-blast-load-inv').addEventListener('click', async () => {
            const btn = panel.querySelector('#mt-blast-load-inv');
            btn.disabled = true; btn.textContent = 'Loading...';
            try {
                const myUid = await getMyUserId();
                if (!myUid) { mtLog('Not logged in', 'err', 'blast'); btn.disabled = false; btn.textContent = 'Load My Inventory'; return; }
                if (!Object.keys(koromonsItems).length) await fetchKoromons();
                const items = await fetchInventory(myUid);
                // Store RAP and Value data
                for (const item of items) {
                    if (item.assetId) {
                        assetRaps[item.assetId] = item.recentAveragePrice || 0;
                        assetValues[item.assetId] = koromonsItems[item.assetId]?.value || 0;
                    }
                }
                console.log('Stored RAP/Value for', Object.keys(assetRaps).length, 'items');
                blastState.myItems = items;
                blastState.mySelected = [];
                const ids = [...new Set(items.map(i => i.assetId).filter(Boolean))];
                if (ids.length) await fetchAssetThumbs(ids);
                renderBlastMyGrid();
                btn.textContent = '✓ Loaded (' + items.length + ' items)';
                mtLog('Loaded ' + items.length + ' items', 'ok', 'blast');
            } catch(e) {
                mtLog('Error: ' + e.message, 'err', 'blast');
                btn.disabled = false; btn.textContent = 'Load My Inventory';
            }
        });

        // Auto-load target items grid
        let allTargetItems = [];
        (async () => {
            const grid = document.getElementById('mt-blast-target-grid');
            try {
                // Fetch collectibles from Koromons (only collectibles, no clothing)
                if (!Object.keys(koromonsItems).length) await fetchKoromons();

                // Filter out clothing and get unique collectibles
                const collectibles = Object.values(koromonsItems).filter(item => {
                    const name = (item.name || '').toLowerCase();
                    // Filter out common clothing types
                    if (name.includes('shirt') || name.includes('pants') || name.includes('t-shirt')) return false;
                    if (name.includes('jacket') || name.includes('hoodie') || name.includes('sweater')) return false;
                    return item.value > 0; // Only items with value
                });

                // Sort by value descending
                collectibles.sort((a, b) => (b.value || 0) - (a.value || 0));

                allTargetItems = collectibles.slice(0, 100); // Top 100 items

                // Fetch thumbnails
                const assetIds = allTargetItems.map(i => i.assetId);
                await fetchAssetThumbs(assetIds);

                renderTargetGrid(allTargetItems);
                mtLog('Loaded ' + allTargetItems.length + ' collectible items', 'ok', 'blast');
            } catch(e) {
                grid.innerHTML = '<div style="padding:20px;color:#ff4444;text-align:center">Error loading items</div>';
                mtLog('Error loading items: ' + e.message, 'err', 'blast');
            }
        })();

        // Filter items as user types
        panel.querySelector('#mt-blast-asset-input').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (!query) {
                renderTargetGrid(allTargetItems);
                return;
            }
            const filtered = allTargetItems.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.assetId.toString().includes(query)
            );
            renderTargetGrid(filtered);
        });

        function renderTargetGrid(items) {
            const grid = document.getElementById('mt-blast-target-grid');
            if (!items.length) {
                grid.innerHTML = '<div style="padding:20px;color:#666;text-align:center">No items found</div>';
                return;
            }

            grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:6px"></div>';
            const container = grid.querySelector('div');

            for (const item of items) {
                const thumb = assetThumbs[item.assetId] || ITEM_FB;
                const card = document.createElement('div');
                card.style.cssText = 'background:#1a1a1a;border:2px solid transparent;border-radius:6px;padding:6px;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px';
                card.innerHTML =
                    '<img src="' + thumb + '" style="width:70px;height:70px;border-radius:4px;object-fit:contain;background:#2b2d2f">' +
                    '<div style="font-size:9px;font-weight:600;color:#fff;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%">' + esc(item.name) + '</div>' +
                    '<div style="font-size:8px;color:#4fc3f7;font-weight:700">' + (item.value || 0).toLocaleString() + '</div>';

                card.addEventListener('mouseenter', () => {
                    card.style.borderColor = '#4fc3f7';
                    card.style.background = '#232323';
                    card.style.transform = 'translateY(-2px)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.borderColor = 'transparent';
                    card.style.background = '#1a1a1a';
                    card.style.transform = '';
                });

                card.addEventListener('click', () => {
                    blastState.targetAssetId = item.assetId;
                    document.getElementById('mt-blast-selected-thumb').src = thumb;
                    document.getElementById('mt-blast-selected-name').textContent = item.name;
                    document.getElementById('mt-blast-selected-item').style.display = 'block';
                    document.getElementById('mt-blast-owner-count').textContent = 'Click "Find Owners" to search';
                    mtLog('Selected: ' + item.name, 'ok', 'blast');
                });

                container.appendChild(card);
            }
        }

        // Find owners
        panel.querySelector('#mt-blast-find-owners').addEventListener('click', async () => {
            if (!blastState.targetAssetId) { mtLog('Search and select an item first', 'err', 'blast'); return; }

            const assetId = blastState.targetAssetId;
            const assetName = document.getElementById('mt-blast-selected-name').textContent;
            const btn = panel.querySelector('#mt-blast-find-owners');
            btn.disabled = true; btn.textContent = 'Finding...';

            document.getElementById('mt-blast-owner-count').textContent = 'Fetching owners...';
            mtLog('Fetching all owners of "' + assetName + '"...', 'info', 'blast');

            try {
                const myUid = await getMyUserId();
                const owners = await fetchAssetOwners(assetId);
                blastState.targetOwners = owners.filter(o => o.userId !== myUid);

                document.getElementById('mt-blast-owner-count').textContent = blastState.targetOwners.length + ' owners found';
                mtLog('Found ' + blastState.targetOwners.length + ' owners', 'ok', 'blast');
                updateBlastSummary();

            } catch(e) {
                mtLog('Error: ' + e.message, 'err', 'blast');
            }
            btn.disabled = false; btn.textContent = 'Find Owners';
        });

        // Send
        panel.querySelector('#mt-blast-btn').addEventListener('click', () => {
            if (!blastState.mySelected.length) { mtLog('Select items to offer first', 'err', 'blast'); return; }
            if (!blastState.targetOwners.length) { mtLog('Find owners first', 'err', 'blast'); return; }
            const maxSend = blastState.maxSendCount;
            const sendCount = maxSend ? Math.min(maxSend, blastState.targetOwners.length) : blastState.targetOwners.length;

            let message;
            if (sendCount > 85) {
                message = 'Are you sure you want to send this trade to ' + sendCount + ' users?\n\n⚠ CAREFUL OF YOUR ACTIONS! ⚠\n\nYou will offer ' + blastState.mySelected.length + ' item(s).';
            } else {
                message = 'Blast trade to ' + sendCount + ' owner' + (sendCount > 1 ? 's' : '') + '?\n\nYou will offer ' + blastState.mySelected.length + ' item(s).';
            }

            showConfirm(message, doBlast);
        });

        // Stop
        panel.querySelector('#mt-blast-stop-btn').addEventListener('click', () => {
            blastState.stopped = true;
            mtLog('Stopping...', 'info', 'blast');
        });

        // Max users controls
        const updateMaxDisplay = () => {
            const display = document.getElementById('mt-max-display');
            if (!display) return;
            display.textContent = blastState.maxSendCount === null ? 'All' : blastState.maxSendCount;
        };

        panel.querySelector('#mt-max-dec').addEventListener('click', () => {
            if (blastState.maxSendCount === null) {
                blastState.maxSendCount = blastState.targetOwners.length || 1;
            }
            if (blastState.maxSendCount > 1) {
                blastState.maxSendCount--;
                updateMaxDisplay();
            }
        });

        panel.querySelector('#mt-max-inc').addEventListener('click', () => {
            const max = blastState.targetOwners.length;
            if (blastState.maxSendCount === null) {
                blastState.maxSendCount = 1;
            } else if (max && blastState.maxSendCount < max) {
                blastState.maxSendCount++;
            } else if (!max) {
                blastState.maxSendCount++;
            }
            updateMaxDisplay();
        });

        panel.querySelector('#mt-max-all').addEventListener('click', () => {
            blastState.maxSendCount = null;
            updateMaxDisplay();
        });

        // Delay controls
        const updateDelayDisplay = () => {
            const display = document.getElementById('mt-delay-display');
            if (!display) return;
            const sec = blastState.delaySeconds;
            if (sec >= 60) {
                const min = Math.floor(sec / 60);
                const remSec = sec % 60;
                display.textContent = min + 'm' + (remSec > 0 ? ' ' + remSec + 's' : '');
            } else {
                display.textContent = sec + 's';
            }
        };

        panel.querySelector('#mt-delay-dec').addEventListener('click', () => {
            if (blastState.delaySeconds > 5) {
                if (blastState.delaySeconds <= 60) blastState.delaySeconds -= 5;
                else if (blastState.delaySeconds <= 300) blastState.delaySeconds -= 30;
                else blastState.delaySeconds -= 60;
                updateDelayDisplay();
            }
        });

        panel.querySelector('#mt-delay-inc').addEventListener('click', () => {
            if (blastState.delaySeconds < 1200) {
                if (blastState.delaySeconds < 60) blastState.delaySeconds += 5;
                else if (blastState.delaySeconds < 300) blastState.delaySeconds += 30;
                else blastState.delaySeconds += 60;
                updateDelayDisplay();
            }
        });

        updateMaxDisplay();
        updateDelayDisplay();
    }

    function renderBlastMyGrid() {
        const wrap = document.getElementById('mt-blast-my-items');
        if (!wrap) return;
        if (!blastState.myItems.length) { wrap.innerHTML = '<div class="mt-placeholder">No items</div>'; return; }
        wrap.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'mt-items-grid';
        for (const item of blastState.myItems) {
            const k = getKoromons(item.assetId);
            const thumb = assetThumbs[item.assetId] || ITEM_FB;
            const name = item.name || 'Asset ' + item.assetId;
            const isSel = blastState.mySelected.some(s => s.userAssetId === item.userAssetId);
            const isMaxed = blastState.mySelected.length >= MAX_SELECT && !isSel;
            const card = document.createElement('div');
            card.className = 'mt-item-card' + (isSel ? ' mt-item-sel' : '') + (isMaxed ? ' mt-item-maxed' : '');
            let tags = '';
            if (k) {
                if (k.value) tags += '<span class="mt-tag mt-tag-v">' + (k.value||0).toLocaleString() + '</span>';
                if (k.rap) tags += '<span class="mt-tag mt-tag-r">' + (k.rap||0).toLocaleString() + '</span>';
            }
            card.innerHTML =
                '<div class="mt-item-img-wrap"><img src="' + thumb + '" onerror="this.src=\'' + ITEM_FB + '\'"></div>' +
                '<div class="mt-item-name" title="' + esc(name) + '">' + esc(name) + '</div>' +
                (tags ? '<div class="mt-item-tags">' + tags + '</div>' : '');
            if (!isMaxed) {
                card.addEventListener('click', () => {
                    const idx = blastState.mySelected.findIndex(s => s.userAssetId === item.userAssetId);
                    if (idx >= 0) blastState.mySelected.splice(idx, 1);
                    else if (blastState.mySelected.length < MAX_SELECT) blastState.mySelected.push(item);
                    renderBlastMyGrid();
                    updateBlastSummary();
                    updateMassTradeTotal();
                });
            }
            grid.appendChild(card);
        }
        wrap.appendChild(grid);
        const cnt = document.getElementById('mt-blast-my-count');
        if (cnt) cnt.textContent = '(' + blastState.mySelected.length + '/4)';
    }

    function restoreLogs(mode) {
        const logId = mode === 'blast' ? 'mt-blast-log' : 'mt-log';
        const state = mode === 'blast' ? blastState : massState;
        const log = document.getElementById(logId);
        if (!log || !state.logs.length) return;

        log.innerHTML = '';
        for (const entry of state.logs) {
            const d = document.createElement('div');
            d.className = 'mt-log-item mt-log-' + entry.type;
            d.textContent = entry.msg;
            log.appendChild(d);
        }
        log.scrollTop = log.scrollHeight;
    }

    function updateBlastSummary() {
        const el = document.getElementById('mt-blast-summary');
        const btn = document.getElementById('mt-blast-btn');
        if (!el) return;

        if (blastState.targetOwners.length && blastState.targetAssetId) {
            el.style.display = 'block';
            const myVal = blastState.mySelected.reduce((s, i) => s + ((koromonsItems[i.assetId]||{}).value||0), 0);
            el.innerHTML =
                '<b style="color:#fff">' + blastState.targetOwners.length + '</b> owners will receive a trade<br>' +
                'Offering: <b style="color:#fff">' + (blastState.mySelected.length ? blastState.mySelected.map(i => i.name || 'item').join(', ') : 'nothing selected') + '</b>' + (myVal ? ' (Value: ' + myVal.toLocaleString() + ')' : '');
        } else {
            el.style.display = 'none';
        }

        if (btn) btn.disabled = !blastState.mySelected.length || !blastState.targetOwners.length;
    }

    async function doBlast() {
        if (blastState.sending) return;
        blastState.sending = true;
        blastState.stopped = false;

        const blastBtn = document.getElementById('mt-blast-btn');
        const stopBtn = document.getElementById('mt-blast-stop-btn');
        const progress = document.getElementById('mt-blast-progress');
        const progressBar = document.getElementById('mt-blast-progress-bar');

        const maxSend = blastState.maxSendCount;

        if (blastBtn) blastBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = '';
        if (progress) progress.style.display = 'block';

        const myUid = await getMyUserId();
        const allOwners = blastState.targetOwners;
        const owners = maxSend ? allOwners.slice(0, maxSend) : allOwners;
        let sent = 0, failed = 0, skipped = 0;

        mtLog('Blasting to ' + owners.length + ' owners' + (maxSend ? ' (limited to ' + maxSend + ')' : '') + '...', 'info', 'blast');

        for (let i = 0; i < owners.length; i++) {
            if (blastState.stopped) {
                mtLog('⏹ Stopped. Sent: ' + sent + ' | Failed: ' + failed + ' | Skipped: ' + skipped, 'info', 'blast');
                break;
            }

            const owner = owners[i];
            if (progressBar) progressBar.style.width = Math.round((i / owners.length) * 100) + '%';

            try {
                await apiPost(EP_TRADE_SEND, {
                    offers: [
                        { userId: myUid, userAssetIds: blastState.mySelected.map(x => x.userAssetId) },
                        { userId: owner.userId, userAssetIds: [owner.userAssetId] }
                    ]
                });
                sent++;
                mtLog('✓ [' + (i+1) + '/' + owners.length + '] ' + owner.username, 'ok', 'blast');
            } catch(e) {
                const msg = (e.message || '').toLowerCase();
                if (msg.includes('already') || msg.includes('pending') || msg.includes('429') || msg.includes('flood')) {
                    skipped++;
                    mtLog('⚠ [' + (i+1) + '/' + owners.length + '] Skipped ' + owner.username, 'info', 'blast');
                } else {
                    failed++;
                    mtLog('✗ [' + (i+1) + '/' + owners.length + '] ' + owner.username + ': ' + e.message, 'err', 'blast');
                }
            }

            if (i < owners.length - 1 && !blastState.stopped) {
                await new Promise(r => setTimeout(r, blastState.delaySeconds * 1000));
            }
        }

        if (progressBar) progressBar.style.width = '100%';
        mtLog('✅ Done! Sent: ' + sent + ' | Failed: ' + failed + ' | Skipped: ' + skipped, 'ok', 'blast');

        blastState.sending = false;
        if (blastBtn) { blastBtn.style.display = ''; blastBtn.disabled = false; }
        if (stopBtn) stopBtn.style.display = 'none';
    }


    // Custom mode state & handlers
    let massState = {
        myUserId: null, myItems: [], mySelected: [],
        targets: [], sending: false, logs: []
    };

    // Store RAP and Value data for mass trade calculations
    const assetRaps = {};
    const assetValues = {};

    function initCustomMode(panel) {
        // How-to toggle
        panel.querySelector('#mt-how-toggle').addEventListener('click', () => {
            const box = document.getElementById('mt-how-box');
            const btn = document.getElementById('mt-how-toggle');
            const open = box.style.display === 'none';
            box.style.display = open ? 'block' : 'none';
            btn.textContent = open ? '▲ Hide instructions' : '? How to use';
        });

        // Load inventory
        panel.querySelector('#mt-load-inv').addEventListener('click', async () => {
            const btn = panel.querySelector('#mt-load-inv');
            btn.disabled = true; btn.textContent = 'Loading...';
            try {
                const myUid = await getMyUserId();
                if (!myUid) { mtLog('Not logged in', 'err', 'custom'); btn.disabled = false; btn.textContent = 'Load My Inventory'; return; }
                if (!Object.keys(koromonsItems).length) await fetchKoromons();
                const items = await fetchInventory(myUid);
                massState.myItems = items;
                massState.mySelected = [];
                const ids = [...new Set(items.map(i => i.assetId).filter(Boolean))];
                if (ids.length) await fetchAssetThumbs(ids);
                renderMassMyGrid();
                btn.textContent = '✓ Loaded (' + items.length + ' items)';
                mtLog('Loaded ' + items.length + ' items', 'ok', 'custom');
            } catch(e) {
                mtLog('Error: ' + e.message, 'err', 'custom');
                btn.disabled = false; btn.textContent = 'Load My Inventory';
            }
        });

        // Add target
        panel.querySelector('#mt-add-target').addEventListener('click', async () => {
            const userRaw = panel.querySelector('#mt-user-input').value.trim();
            const assetRaw = panel.querySelector('#mt-asset-input').value.trim();
            if (!userRaw) { mtLog('Enter a username or user ID', 'err', 'custom'); return; }
            if (!assetRaw || !/^\d+$/.test(assetRaw)) { mtLog('Enter a valid asset ID', 'err', 'custom'); return; }

            const btn = panel.querySelector('#mt-add-target');
            btn.disabled = true; btn.textContent = '...';

            const assetId = parseInt(assetRaw);
            const entryId = Date.now();

            massState.targets.push({ entryId, userId: null, username: userRaw, assetId, assetName: '', userAssetId: null, status: 'loading' });
            renderTargetsList();

            try {
                const userId = await resolveUserId(userRaw);
                let username = userRaw;
                try {
                    const u = await apiGet(BASE + '/apisite/users/v1/users/' + userId, true);
                    if (u && u.displayName) username = u.displayName;
                } catch {}

                let assetName = 'Asset #' + assetId;
                try {
                    const meta = await apiGet(BASE + '/apisite/catalog/v1/catalog/items/' + assetId + '/details?itemType=Asset', true);
                    if (meta && meta.name) assetName = meta.name;
                } catch {}

                const found = await findUserItem(userId, assetId);

                const entry = massState.targets.find(t => t.entryId === entryId);
                if (entry) {
                    entry.userId = userId;
                    entry.username = username;
                    entry.assetName = assetName;
                    if (found) {
                        entry.userAssetId = found.userAssetId;
                        entry.status = 'ready';
                        mtLog('✓ ' + username + ' has ' + assetName, 'ok', 'custom');
                    } else {
                        entry.status = 'missing';
                        mtLog('✗ ' + username + ' does not have ' + assetName, 'err', 'custom');
                    }
                }

            } catch(e) {
                const entry = massState.targets.find(t => t.entryId === entryId);
                if (entry) { entry.status = 'error'; entry.assetName = e.message; }
                mtLog('Error: ' + e.message, 'err', 'custom');
            }

            renderTargetsList();
            updateSendBtn();
            panel.querySelector('#mt-user-input').value = '';
            btn.disabled = false; btn.textContent = 'Add';
        });

        // Send all
        panel.querySelector('#mt-send-all').addEventListener('click', () => {
            const ready = massState.targets.filter(t => t.status === 'ready');
            if (!massState.mySelected.length) { mtLog('Select items to offer first', 'err', 'custom'); return; }
            if (!ready.length) { mtLog('No ready targets to send to', 'err', 'custom'); return; }
            showConfirm('Send ' + ready.length + ' trade(s)?', doSendAll);
        });
    }

    function renderMassMyGrid() {
        const wrap = document.getElementById('mt-my-items');
        if (!wrap) return;
        if (!massState.myItems.length) { wrap.innerHTML = '<div class="mt-placeholder">No items</div>'; return; }
        wrap.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'mt-items-grid';
        for (const item of massState.myItems) {
            const k = getKoromons(item.assetId);
            const thumb = assetThumbs[item.assetId] || ITEM_FB;
            const name = item.name || 'Asset ' + item.assetId;
            const isSel = massState.mySelected.some(s => s.userAssetId === item.userAssetId);
            const isMaxed = massState.mySelected.length >= MAX_SELECT && !isSel;
            const card = document.createElement('div');
            card.className = 'mt-item-card' + (isSel ? ' mt-item-sel' : '') + (isMaxed ? ' mt-item-maxed' : '');
            let tags = '';
            if (k) {
                if (k.value) tags += '<span class="mt-tag mt-tag-v">' + (k.value||0).toLocaleString() + '</span>';
                if (k.rap) tags += '<span class="mt-tag mt-tag-r">' + (k.rap||0).toLocaleString() + '</span>';
            }
            card.innerHTML =
                '<div class="mt-item-img-wrap"><img src="' + thumb + '" onerror="this.src=\'' + ITEM_FB + '\'" /></div>' +
                '<div class="mt-item-name" title="' + esc(name) + '">' + esc(name) + '</div>' +
                (tags ? '<div class="mt-item-tags">' + tags + '</div>' : '');
            if (!isMaxed) {
                card.addEventListener('click', () => {
                    const idx = massState.mySelected.findIndex(s => s.userAssetId === item.userAssetId);
                    if (idx >= 0) massState.mySelected.splice(idx, 1);
                    else if (massState.mySelected.length < MAX_SELECT) massState.mySelected.push(item);
                    renderMassMyGrid();
                    updateSendBtn();
                });
            }
            grid.appendChild(card);
        }
        wrap.appendChild(grid);
        const cnt = document.getElementById('mt-my-count');
        if (cnt) cnt.textContent = '(' + massState.mySelected.length + '/4)';
    }

    function renderTargetsList() {
        const list = document.getElementById('mt-targets-list');
        if (!list) return;
        if (!massState.targets.length) { list.innerHTML = '<div class="mt-placeholder">No users added yet</div>'; return; }
        list.innerHTML = '';
        for (const t of massState.targets) {
            const row = document.createElement('div');
            row.className = 'mt-target-row';
            const statusIcon =
                t.status === 'loading' ? '<span class="mt-ts mt-ts-loading">⏳</span>' :
                t.status === 'ready'   ? '<span class="mt-ts mt-ts-ready">✓</span>' :
                t.status === 'missing' ? '<span class="mt-ts mt-ts-missing">No item found "' + esc(t.username) + '"</span>' :
                t.status === 'sent'    ? '<span class="mt-ts mt-ts-sent">✓ Sent</span>' :
                t.status === 'failed'  ? '<span class="mt-ts mt-ts-failed">✗ Failed</span>' :
                                         '<span class="mt-ts mt-ts-missing">✗ Error</span>';
            row.innerHTML =
                '<div class="mt-target-info">' +
                    '<span class="mt-target-user">' + esc(t.username) + '</span>' +
                    (t.assetName && t.status !== 'loading' ? '<span class="mt-target-item">' + esc(t.assetName) + '</span>' : '') +
                '</div>' +
                statusIcon +
                (t.status !== 'loading' && t.status !== 'sent' && t.status !== 'failed' ?
                    '<button class="mt-remove-btn" data-id="' + t.entryId + '">✕</button>' : '');
            list.appendChild(row);
        }
        list.querySelectorAll('.mt-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                massState.targets = massState.targets.filter(t => t.entryId !== id);
                renderTargetsList();
                updateSendBtn();
            });
        });
    }

    function updateSendBtn() {
        const btn = document.getElementById('mt-send-all');
        if (!btn) return;
        const ready = massState.targets.filter(t => t.status === 'ready').length;
        btn.disabled = !massState.mySelected.length || !ready;
        btn.textContent = ready ? 'Send ' + ready + ' Trade' + (ready > 1 ? 's' : '') : 'Send All Trades';
    }

    async function doSendAll() {
        if (massState.sending) return;
        massState.sending = true;
        const myUid = await getMyUserId();
        const ready = massState.targets.filter(t => t.status === 'ready');
        mtLog('Sending ' + ready.length + ' trade(s)...', 'info', 'custom');
        for (const t of ready) {
            try {
                await apiPost(EP_TRADE_SEND, {
                    offers: [
                        { userId: myUid, userAssetIds: massState.mySelected.map(x => x.userAssetId) },
                        { userId: t.userId, userAssetIds: [t.userAssetId] }
                    ]
                });
                t.status = 'sent';
                mtLog('✓ Sent to ' + t.username, 'ok', 'custom');
            } catch(e) {
                t.status = 'failed';
                mtLog('✗ ' + t.username + ': ' + e.message, 'err', 'custom');
            }
            renderTargetsList();
            updateSendBtn();
            if (ready.indexOf(t) < ready.length - 1) await new Promise(r => setTimeout(r, 20000));
        }
        massState.sending = false;
        mtLog('Done!', 'ok', 'custom');
    }


    function closeMassTradePanel() {
        // Don't reset state when closing - preserve progress
        document.getElementById('mass-trade-ov')?.remove();
        document.getElementById('mass-trade-panel')?.remove();
    }

    function mtLog(msg, type, mode) {
        const logId = mode === 'blast' ? 'mt-blast-log' : 'mt-log';
        const state = mode === 'blast' ? blastState : massState;

        // Save to state
        state.logs.push({ msg, type: type || 'info' });

        // Update DOM if panel is open
        const log = document.getElementById(logId);
        if (!log) return;
        const d = document.createElement('div');
        d.className = 'mt-log-item mt-log-' + (type || 'info');
        d.textContent = msg;
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
    }


    function showBlacklistPanel() {
        const old = document.getElementById('blacklist-ov');
        if (old) { old.remove(); document.getElementById('blacklist-panel')?.remove(); return; }
        injectCss();

        const ov = document.createElement('div');
        ov.id = 'blacklist-ov';
        ov.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:999998';
        ov.addEventListener('click', e => { if (e.target === ov) closeBlacklistPanel(); });
        document.body.appendChild(ov);

        const panel = document.createElement('div');
        panel.id = 'blacklist-panel';
        panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;max-height:80vh;background:#393b3d;border-radius:8px;z-index:999999;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,.7);font-family:"Gotham SSm","Gotham",sans-serif';

        panel.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#2b2d2f;border-radius:8px 8px 0 0">' +
                '<div style="display:flex;align-items:center;gap:10px">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                    '<span style="font-size:16px;font-weight:700;color:#fff">Manage Blacklist</span>' +
                '</div>' +
                '<span style="color:#b8b8b8;font-size:20px;cursor:pointer;padding:4px 8px" id="bl-close">✕</span>' +
            '</div>' +
            '<div style="padding:20px;overflow-y:auto;flex:1">' +
                '<div style="margin-bottom:20px">' +
                    '<div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px">Your Inventory</div>' +
                    '<button style="width:100%;padding:12px;background:#0074bd;border:none;border-radius:0;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit" id="bl-load-inv">Load My Inventory</button>' +
                    '<div id="bl-inv-grid" style="margin-top:12px"></div>' +
                '</div>' +
                '<div>' +
                    '<div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px">Blacklisted Items (<span id="bl-count">0</span>)</div>' +
                    '<div id="bl-list" style="display:flex;flex-direction:column;gap:8px"></div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(panel);
        panel.querySelector('#bl-close').addEventListener('click', closeBlacklistPanel);

        // Load inventory
        panel.querySelector('#bl-load-inv').addEventListener('click', async () => {
            const btn = panel.querySelector('#bl-load-inv');
            btn.disabled = true;
            btn.textContent = 'Loading...';
            try {
                const myUid = await getMyUserId();
                if (!myUid) { alert('Not logged in'); btn.disabled = false; btn.textContent = 'Load My Inventory'; return; }
                if (!Object.keys(koromonsItems).length) await fetchKoromons();
                const items = await fetchInventory(myUid);
                const ids = [...new Set(items.map(i => i.assetId).filter(Boolean))];
                if (ids.length) await fetchAssetThumbs(ids);
                renderBlacklistInventory(items);
                btn.textContent = '✓ Loaded (' + items.length + ' items)';
            } catch(e) {
                alert('Error: ' + e.message);
                btn.disabled = false;
                btn.textContent = 'Load My Inventory';
            }
        });

        renderBlacklistList();
    }

    function renderBlacklistInventory(items) {
        const grid = document.getElementById('bl-inv-grid');
        if (!grid) return;
        if (!items.length) { grid.innerHTML = '<div style="text-align:center;color:#666;padding:20px">No items found</div>'; return; }

        grid.innerHTML = '';
        const container = document.createElement('div');
        container.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px';

        for (const item of items) {
            const itemBlacklisted = isBlacklisted(item.assetId);
            const card = document.createElement('div');
            card.style.cssText = 'background:#2b2d2f;border-radius:6px;padding:8px;cursor:pointer;transition:all .15s;border:2px solid ' + (isBlacklisted ? '#ff4444' : 'transparent');
            card.innerHTML =
                '<img src="' + (assetThumbs[item.assetId] || ITEM_FB) + '" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;margin-bottom:6px">' +
                '<div style="font-size:10px;color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(item.name || 'Asset ' + item.assetId) + '">' + esc(item.name || 'Asset ' + item.assetId) + '</div>' +
                '<div style="font-size:9px;color:#666;margin-top:2px">ID: ' + item.assetId + '</div>';

            card.addEventListener('click', () => {
                if (isBlacklisted(item.assetId)) {
                    unblacklistItem(item.assetId);
                } else {
                    blacklistItem(item.assetId);
                }
                renderBlacklistInventory(items);
                renderBlacklistList();
            });

            card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 4px 12px rgba(0,0,0,.4)'; });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });

            container.appendChild(card);
        }
        grid.appendChild(container);
    }

    function renderBlacklistList() {
        const list = document.getElementById('bl-list');
        const count = document.getElementById('bl-count');
        if (!list) return;

        const blacklistArray = [...blacklistedItems];
        if (count) count.textContent = blacklistArray.length;

        if (!blacklistArray.length) {
            list.innerHTML = '<div style="text-align:center;color:#666;padding:20px">No blacklisted items</div>';
            return;
        }

        list.innerHTML = '';
        for (const assetId of blacklistArray) {
            const k = getKoromons(assetId);
            const itemName = (k && k.name) || ('Asset #' + assetId);
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px;background:#2b2d2f;border-radius:6px';
            row.innerHTML =
                '<div style="display:flex;align-items:center;gap:10px">' +
                    '<img src="' + (assetThumbs[assetId] || ITEM_FB) + '" style="width:40px;height:40px;border-radius:4px;object-fit:cover">' +
                    '<div>' +
                        '<div style="font-size:12px;color:#fff;font-weight:700">' + esc(itemName) + '</div>' +
                        '<div style="font-size:10px;color:#666">ID: ' + assetId + '</div>' +
                    '</div>' +
                '</div>' +
                '<button style="padding:6px 14px;border:none;border-radius:4px;background:#ff4444;color:#fff;font-size:11px;font-weight:700;cursor:pointer" data-id="' + assetId + '">Remove</button>';

            row.querySelector('button').addEventListener('click', () => {
                unblacklistItem(assetId);
                renderBlacklistList();
            });

            list.appendChild(row);
        }
    }

    function closeBlacklistPanel() {
        document.getElementById('blacklist-ov')?.remove();
        document.getElementById('blacklist-panel')?.remove();
    }


    function mtLog(msg, type, mode) {
        const logId = mode === 'blast' ? 'mt-blast-log' : 'mt-log';
        const state = mode === 'blast' ? blastState : massState;

        // Save to state
        state.logs.push({ msg, type: type || 'info' });

        // Update DOM if panel is open
        const log = document.getElementById(logId);
        if (!log) return;
        const d = document.createElement('div');
        d.className = 'mt-log-item mt-log-' + (type || 'info');
        d.textContent = msg;
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
    }


    // PEKORA TRADES PAGE - WIN/LOSS INDICATORS

    let indicatorRunning = false;

    async function injectPekoraIndicators() {
        if (indicatorRunning) return;
        if (!window.location.pathname.includes('/My/Trades.aspx') && !window.location.href.includes('/My/Trades')) return;

        indicatorRunning = true;

        // Wait for React to render rows
        await new Promise(r => setTimeout(r, 800));

        // Find all trade rows using generic selectors
        const rows = document.querySelectorAll('tr[class*="row-"]');
        if (!rows.length) { indicatorRunning = false; return; }

        for (const row of rows) {
            if (row.dataset.tnDone) continue;
            row.dataset.tnDone = '1';

            // Find trade ID -- look for links or onclick with TradeSessionId
            let tradeId = null;

            // Method 1: links
            for (const a of row.querySelectorAll('a[href]')) {
                const m = a.href.match(/TradeSessionId[=:](\d+)/i);
                if (m) { tradeId = parseInt(m[1]); break; }
            }

            // Method 2: any element with onclick containing trade id
            if (!tradeId) {
                const allEls = row.querySelectorAll('[onclick]');
                for (const el of allEls) {
                    const m = (el.getAttribute('onclick') || '').match(/(\d{8,})/);
                    if (m) { tradeId = parseInt(m[1]); break; }
                }
            }

            // Method 3: look for the "View Details" p tag and check parent link
            if (!tradeId) {
                const vd = row.querySelector('p[class*="viewDetails"]');
                if (vd) {
                    const parentLink = vd.closest('a[href]');
                    if (parentLink) {
                        const m = parentLink.href.match(/TradeSessionId[=:](\d+)/i) || parentLink.href.match(/\/(\d+)$/);
                        if (m) tradeId = parseInt(m[1]);
                    }
                }
            }

            if (!tradeId) continue;

            // Get last cell in row to attach indicator
            const cells = row.querySelectorAll('td');
            const lastCell = cells[cells.length - 1];
            if (!lastCell) continue;

            // Make it position relative for absolute indicator
            lastCell.style.position = 'relative';
            lastCell.style.paddingRight = '90px';

            // Show loading indicator
            const loadInd = document.createElement('div');
            loadInd.className = 'pkr-indicator pkr-indicator-gray';
            loadInd.innerHTML = '<div class="pkr-indicator-top" style="font-size:9px">...</div>';
            lastCell.appendChild(loadInd);

            // Fetch trade details async
            (async (tid, cell, ind) => {
                try {
                    await fetchKoromons();
                    const det = await fetchDetail(tid);
                    if (!det || !Array.isArray(det.offers) || det.offers.length < 2) { ind.remove(); return; }

                    // Figure out which offer is mine vs theirs
                    // The offer with more items from the perspective of the API:
                    // offers[0] = trade initiator, offers[1] = trade receiver
                    // We are the receiver (inbound), so our offer is offers[1]
                    // and sender's offer is offers[0]
                    const theirOffer = det.offers[0];
                    const myOffer = det.offers[1];

                    const sv = offerTotals(myOffer);   // what I give
                    const rv = offerTotals(theirOffer); // what I receive

                    const vDiff = rv.tv - sv.tv;
                    const rDiff = rv.tr - sv.tr;

                    let barClass = 'pkr-indicator-gray';
                    if (vDiff > 100 || (sv.tv === 0 && rv.tv === 0 && rDiff > 100)) barClass = 'pkr-indicator-green';
                    else if (vDiff < -100 || (sv.tv === 0 && rv.tv === 0 && rDiff < -100)) barClass = 'pkr-indicator-red';

                    const topVal = rv.tv || rv.tr || 0;
                    const botVal = sv.tv || sv.tr || 0;

                    ind.className = 'pkr-indicator ' + barClass;
                    ind.innerHTML =
                        '<div class="pkr-indicator-top">' + topVal.toLocaleString() + '</div>' +
                        '<div class="pkr-indicator-bottom">' + botVal.toLocaleString() + '</div>';

                } catch (e) { ind.remove(); }
            })(tradeId, lastCell, loadInd);
        }

        indicatorRunning = false;
    }

    // Badge, sidebar, panel rendering
    function injectBadge() {
        if (document.getElementById('tn-b')) return;
        if (!extEnabled(17)) return;
        const ul = document.querySelector('ul[class*="linkContainer"]') ||
                   document.querySelector('ul[class*="nav-"]') ||
                   document.querySelector('nav ul');
        if (!ul) return;
        const msg = ul.querySelector('li[class*="messagesContainer"]') ||
                    ul.querySelector('li[class*="message"]');
        const li = document.createElement('li');
        li.id = 'tn-b';
        li.innerHTML = '<a id="tn-ba" href="javascript:void(0)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4L3 8m4-4l4 4M17 8v12l4-4m-4 4l-4-4"/></svg><span id="tn-bc"></span></a>';
        if (msg) msg.after(li); else ul.prepend(li);
        document.getElementById('tn-ba').addEventListener('click', e => { e.preventDefault(); togglePanel(); });
    }
    // Standalone badge injector — independent of init() timing
    if (extEnabled(17)) {
        (function() {
            function tryBadge() { injectBadge(); }
            new MutationObserver(tryBadge).observe(document.body, { childList: true, subtree: true });
            tryBadge();
        })();
    }
    function updateBadge(c) {
        injectBadge();
        const el = document.getElementById('tn-bc');
        if (!el) return;
        el.textContent = c > 0 ? c : '';
        el.style.display = c > 0 ? '' : 'none';
    }
    function roleColor(r) { r=(r||'').toLowerCase(); if(r==='developer') return '#4fc3f7'; if(r==='tester') return '#66bb6a'; if(r==='contributor') return '#e8c44a'; if(r==='designer') return '#ab47bc'; return '#888'; }
    function roleBg(r) { r=(r||'').toLowerCase(); if(r==='developer') return 'rgba(79,195,247,.1)'; if(r==='tester') return 'rgba(102,187,106,.1)'; if(r==='contributor') return 'rgba(232,196,74,.1)'; if(r==='designer') return 'rgba(171,71,188,.1)'; return 'rgba(136,136,136,.1)'; }

    // Standalone sidebar injector — independent of init(), mirrors feature #12's approach
    (function() {
        function tryInjectSidebar() {
            const sidebar = document.querySelector('div[class*="card"]');
            if (!sidebar) return;
            const homeBtn = [...sidebar.querySelectorAll('a')].find(a => a.textContent.trim() === 'Home');
            if (!homeBtn) return;

            if (extEnabled(17) && !document.getElementById('coop-sb')) {
                const btn = homeBtn.cloneNode(true);
                btn.id = 'coop-sb';
                btn.href = 'javascript:void(0)';
                btn.removeAttribute('data-active');
                const icon = btn.querySelector('svg, span[class*="icon"]');
                if (icon) {
                    const w = document.createElement('span');
                    w.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-right:4px;vertical-align:middle;flex-shrink:0;opacity:0.85';
                    w.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';
                    icon.replaceWith(w);
                }
                const textEl = [...btn.querySelectorAll('*')].find(el => el.children.length === 0 && el.textContent.trim() !== '');
                if (textEl) textEl.textContent = 'Trade Notifier';
                btn.addEventListener('click', e => { e.preventDefault(); togglePanel(); });
                const upgradeBtn = [...sidebar.querySelectorAll('a')].find(a => a.textContent.includes('Upgrade'));
                if (upgradeBtn) sidebar.insertBefore(btn, upgradeBtn); else sidebar.appendChild(btn);
            }

            if (extEnabled(18) && !document.getElementById('mass-sb')) {
                const btn2 = homeBtn.cloneNode(true);
                btn2.id = 'mass-sb';
                btn2.href = 'javascript:void(0)';
                btn2.removeAttribute('data-active');
                const icon2 = btn2.querySelector('svg, span[class*="icon"]');
                if (icon2) {
                    const w2 = document.createElement('span');
                    w2.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-right:4px;vertical-align:middle;flex-shrink:0;opacity:0.85';
                    w2.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
                    icon2.replaceWith(w2);
                }
                const textEl2 = [...btn2.querySelectorAll('*')].find(el => el.children.length === 0 && el.textContent.trim() !== '');
                if (textEl2) textEl2.textContent = 'Mass Trade Sender';
                btn2.addEventListener('click', e => { e.preventDefault(); showMassTradePanel(); });
                const upgradeBtn2 = [...sidebar.querySelectorAll('a')].find(a => a.textContent.includes('Upgrade'));
                if (upgradeBtn2) sidebar.insertBefore(btn2, upgradeBtn2); else sidebar.appendChild(btn2);
            }
        }
        new MutationObserver(tryInjectSidebar).observe(document.body, { childList: true, subtree: true });
        tryInjectSidebar();
    })();

    function injectSidebar() {
        if (document.getElementById('coop-sb') && document.getElementById('mass-sb')) return;

        // Same approach as feature #12: find sidebar by card, clone the Home button
        const sidebar = document.querySelector('div[class*="card"]');
        if (!sidebar) return;
        const homeBtn = [...sidebar.querySelectorAll('a')].find(a => a.textContent.trim() === 'Home');
        if (!homeBtn) return;
        const upgradeBtn = [...sidebar.querySelectorAll('a')].find(a => a.textContent.includes('Upgrade'));

        function makeSidebarBtn(id, label, iconSvg, clickHandler) {
            if (document.getElementById(id)) return;
            const btn = homeBtn.cloneNode(true);
            btn.id = id;
            btn.href = 'javascript:void(0)';
            btn.removeAttribute('data-active');
            const existingIcon = btn.querySelector('svg, span[class*="icon"]');
            if (existingIcon) {
                const iconWrap = document.createElement('span');
                iconWrap.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-right:4px;vertical-align:middle;flex-shrink:0;opacity:0.85';
                iconWrap.innerHTML = iconSvg;
                existingIcon.replaceWith(iconWrap);
            }
            const textEl = [...btn.querySelectorAll('*')].find(el => el.children.length === 0 && el.textContent.trim() !== '');
            if (textEl) textEl.textContent = label;
            btn.addEventListener('click', e => { e.preventDefault(); clickHandler(); });
            if (upgradeBtn) sidebar.insertBefore(btn, upgradeBtn); else sidebar.appendChild(btn);
        }

        if (extEnabled(17)) makeSidebarBtn('coop-sb', 'Trade Notifier',
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
            () => togglePanel());

        if (extEnabled(18)) makeSidebarBtn('mass-sb', 'Mass Trade Sender',
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
            () => showMassTradePanel());
    }

    function toggleRow(id, label, key, desc) {
        return '<div class="rol-toggle-row"><span class="rol-toggle-label rol-info-trigger" data-title="' + esc(label) + '" data-desc="' + esc(desc) + '">' + esc(label) + '<svg class="rol-info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span><label class="rol-switch"><input type="checkbox" id="' + id + '" ' + (settings[key] ? 'checked' : '') + '><span class="rol-slider"></span></label></div>';
    }
    function rangeRow(id, label, key, min, max, step, unit) {
        return '<div class="rol-range-row"><div class="rol-range-top"><span class="rol-range-label">' + esc(label) + '</span><span class="rol-range-val" id="' + id + '-val">' + (settings[key] / 1000) + unit + '</span></div><input type="range" class="rol-range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + settings[key] + '"></div>';
    }

    function showInfoModal(title, desc) {
        const existing = document.getElementById('rol-info-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'rol-info-modal';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0);z-index:999999999;display:flex;align-items:center;justify-content:center;transition:background .25s ease';

        overlay.innerHTML = '<div id="rol-info-box" style="background:#2b2d2f;border-radius:0;padding:24px;max-width:600px;box-shadow:0 8px 32px rgba(0,0,0,.6);transform:scale(0.8) translateY(-20px);opacity:0;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1)"><div style="font-size:16px;font-weight:700;color:#4fc3f7;margin-bottom:12px">' + title + '</div><div style="font-size:14px;color:#b8b8b8;line-height:1.6;margin-bottom:20px">' + desc + '</div><button id="rol-info-ok" style="width:100%;padding:10px;background:#0074bd;border:none;border-radius:0;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s">Got it</button></div>';

        document.body.appendChild(overlay);

        // Trigger animations
        requestAnimationFrame(() => {
            overlay.style.background = 'rgba(0,0,0,.8)';
            const box = document.getElementById('rol-info-box');
            if (box) {
                box.style.transform = 'scale(1) translateY(0)';
                box.style.opacity = '1';
            }
        });

        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        document.getElementById('rol-info-ok').addEventListener('click', () => overlay.remove());
    }

    async function showBlockedUsersPanel() {
        console.log('showBlockedUsersPanel called');
        // Remove any existing panel first
        const existing = document.getElementById('rol-panel');
        if (existing) {
            console.log('Removing existing panel');
            existing.remove();
        }
        // Always create a fresh panel
        const p = document.createElement('div');
        console.log('Created new panel element:', p);
        p.id = 'rol-panel';
        p.className = 'rol-panel';

        const blockedEntries = Object.values(blockedUsers);
        const uids = blockedEntries.map(u => u.userId);
        const heads = uids.length > 0 ? await fetchHeads(uids) : {};

        let listHtml = '';
        if (blockedEntries.length > 0) {
            for (const u of blockedEntries) {
                const avatar = heads[u.userId] || ITEM_FB;
                listHtml += '<div class="bl-item"><div class="bl-user-info"><a href="' + BASE + '/users/' + u.userId + '/profile" target="_blank" class="bl-profile-link"><img src="' + avatar + '" class="bl-av"></a><div class="bl-user-details"><a href="' + BASE + '/users/' + u.userId + '/profile" target="_blank" class="bl-name-link">' + esc(u.username) + '</a><span class="bl-id">ID: ' + u.userId + '</span></div></div><button class="bl-unblock-full" data-uid="' + u.userId + '">Unblock</button></div>';
            }
        } else {
            listHtml = '<div class="bl-empty">No blocked users</div>';
        }

        p.innerHTML = '<div class="rol-h"><div class="rol-hl"><span class="rol-title">Blocked Users (' + blockedEntries.length + ')</span></div><span class="rol-x">\u2715</span></div>' +
            '<div class="rol-body"><div class="bl-list">' + listHtml + '</div></div>';

        console.log('Appending panel to body');
        document.body.appendChild(p);
        console.log('Panel appended and should be visible');

        p.querySelector('.rol-x').addEventListener('click', () => p.remove());
        p.querySelectorAll('.bl-unblock-full').forEach(btn => {
            btn.addEventListener('click', () => {
                unblockUser(parseInt(btn.dataset.uid));
                p.remove();
                showBlockedUsersPanel();
            });
        });
    }

    async function showCreditsPanel() {
        const old = document.getElementById('rol-panel');
        if (old) { old.remove(); document.getElementById('coop-ov')?.remove(); return; }
        const ov = document.createElement('div'); ov.id = 'coop-ov';
        ov.addEventListener('click', closeCreditsPanel); document.body.appendChild(ov);
        const fb = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23222%22 width=%221%22 height=%221%22/></svg>";
        let credHtml = '';
        for (const c of creditsList) {
            const img = creditsHeads[c.userId] || fb;
            credHtml += '<a href="' + esc(c.profileUrl) + '" target="_blank" class="cr-card"><img src="' + img + '" class="cr-av"><div class="cr-info"><div class="cr-name">' + esc(c.username) + '</div><div class="cr-meta"><span class="cr-role" style="color:' + roleColor(c.role) + ';background:' + roleBg(c.role) + '">' + esc(c.role) + '</span><span class="cr-id">ID: ' + c.userId + '</span></div><div class="cr-desc">' + esc(c.description) + '</div></div></a>';
        }
        // Fetch headshots + real usernames for blocked users before rendering
        const blockedEntries = Object.values(blockedUsers);
        if (blockedEntries.length) {
            const uids = blockedEntries.map(u => u.userId);
            const heads = await fetchHeads(uids);
            Object.assign(panelHeads, heads);
            const needNames = blockedEntries.filter(u => !u.username || u.username === ('User #' + u.userId));
            if (needNames.length) {
                try {
                    // Try bulk endpoint first
                    const j = await apiGet(BASE + '/apisite/users/v1/users?userIds=' + needNames.map(u => u.userId).join(','), true);
                    const users = j.data || (Array.isArray(j) ? j : []);
                    for (const u of users) {
                        if (blockedUsers[u.id]) blockedUsers[u.id].username = u.displayName || u.name || ('User #' + u.id);
                    }
                    // For any still unnamed, try individual lookup
                    for (const entry of needNames) {
                        if (blockedUsers[entry.userId] && blockedUsers[entry.userId].username === ('User #' + entry.userId)) {
                            try {
                                const u2 = await apiGet(BASE + '/apisite/users/v1/users/' + entry.userId, true);
                                if (u2 && (u2.displayName || u2.name)) blockedUsers[entry.userId].username = u2.displayName || u2.name;
                            } catch {}
                        }
                    }
                    saveBlocked();
                } catch {
                    // Fallback: individual lookups
                    for (const entry of needNames) {
                        try {
                            const u = await apiGet(BASE + '/apisite/users/v1/users/' + entry.userId, true);
                            if (u && (u.displayName || u.name)) {
                                blockedUsers[entry.userId].username = u.displayName || u.name;
                            }
                        } catch {}
                    }
                    saveBlocked();
                }
            }
        }
        const blFb = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23222%22 width=%221%22 height=%221%22/></svg>";
        const updatedBlocked = Object.values(blockedUsers);
        let blHtml = '<div class="rol-section"><div class="rol-section-title">Blocked Users (' + updatedBlocked.length + ')</div>';

        if (updatedBlocked.length > 0) {
            const previewUsers = updatedBlocked.slice(0, 5);
            blHtml += '<div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0">';
            blHtml += '<div style="display:flex">';
            for (let i = 0; i < previewUsers.length; i++) {
                const avatar = panelHeads[previewUsers[i].userId] || blFb;
                blHtml += '<div style="width:32px;height:32px;border-radius:50%;overflow:hidden;background:#111;border:2px solid #393b3d;' + (i > 0 ? 'margin-left:-10px;' : '') + 'position:relative;z-index:' + (10 - i) + '"><img src="' + avatar + '" style="width:100%;height:100%;object-fit:cover"></div>';
            }
            if (updatedBlocked.length > 5) {
                blHtml += '<div style="width:32px;height:32px;border-radius:50%;background:#2b2d2f;border:2px solid #393b3d;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;margin-left:-10px">+' + (updatedBlocked.length - 5) + '</div>';
            }
            blHtml += '</div>';
            blHtml += '<button id="bl-show-panel-btn" style="padding:6px 12px;background:#0074bd;border:1px solid #0074bd;border-radius:4px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s">Show All Blocked Users</button>';
            blHtml += '</div>';


        } else {
            blHtml += '<div class="bl-empty">No blocked users</div>';
        }
        blHtml += '</div>';


        const p = document.createElement('div'); p.id = 'rol-panel';
        p.innerHTML = '<div class="rol-h"><div class="rol-hl"><span style="font-size:28px;font-weight:900;letter-spacing:-3px"><span style="color:#fff">Ro</span><span style="color:#4fc3f7">K</span><span style="color:#fff">orone</span></span><span class="rol-ver" style="margin-left:10px">v1.7</span></div><div style="display:flex;align-items:center;gap:12px"><div id="rol-user-greeting" style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:#111;border:1px solid #393b3d;border-radius:20px"><img id="rol-user-avatar" src="" style="width:32px;height:32px;border-radius:50%;display:none"><span id="rol-user-name" style="font-size:12px;color:#fff;font-weight:600"></span></div><span class="rol-x">\u2715</span></div></div>' +





            '<div class="rol-body"><div class="rol-section"><div class="rol-section-title">Credits</div><div class="cr-list">' + credHtml + '</div></div>' +
            '<div class="rol-section"><div class="rol-section-title">Notifications</div>' + toggleRow('rol-snd','Sound notifications','sound','Play a chime when you receive a new trade.') + toggleRow('rol-desk','Desktop notifications','desktop','Show native desktop notifications.') + toggleRow('rol-toast','Toast popups','toast','Show toast popups with trade details.') + toggleRow('rol-compact','Compact mode','compactMode','Smaller toast notifications.') + '</div>' +
            '<div class="rol-section"><div class="rol-section-title">Spam Protection</div>' + toggleRow('rol-spam','Auto-block spammers','spamProtection','Block users who spam trades.') +
            '<div class="rol-range-row"><div class="rol-range-top"><span class="rol-range-label">Spam threshold (trades)</span><span class="rol-range-val" id="rol-spam-threshold-val">' + settings.spamThreshold + '</span></div><input type="range" class="rol-range" id="rol-spam-threshold" min="2" max="10" step="1" value="' + settings.spamThreshold + '"></div>' +
            '<div class="rol-range-row"><div class="rol-range-top"><span class="rol-range-label">Time window</span><span class="rol-range-val" id="rol-spam-window-val">' + (settings.spamTimeWindow/60000) + 'm</span></div><input type="range" class="rol-range" id="rol-spam-window" min="60000" max="600000" step="60000" value="' + settings.spamTimeWindow + '"></div></div>' +
            '<div class="rol-section"><div class="rol-section-title">Blacklist</div>' +
            toggleRow('rol-auto-decline-blacklist', 'Auto-decline blacklisted items', 'autoDeclineBlacklist', 'Automatically decline incoming trades that contain any item on your blacklist.') +
            toggleRow('rol-auto-decline-blocked', 'Auto-decline blocked users', 'autoDeclineBlocked', 'Automatically decline incoming trades from users on your blocked list.') +
            '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:#2b2d2f;border-radius:6px;gap:10px;margin-top:6px">' +
                '<div style="display:flex;flex-direction:column;gap:4px;flex:1">' +
                    '<span style="font-size:12px;color:#fff;font-weight:700">Manage blacklisted items</span>' +
                    '<div style="display:flex;align-items:center;gap:8px">' +
                        '<span style="font-size:10px;color:#b8b8b8"><span id="rol-bl-count">0</span> item(s) currently blacklisted</span>' +
                        '<div id="rol-bl-preview" style="display:flex;gap:4px"></div>' +
                    '</div>' +
                '</div>' +
                '<button style="padding:8px 16px;background:#ff4444;border:none;border-radius:4px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0" id="rol-manage-blacklist">Manage</button>' +
            '</div></div>' +
            '<div class="rol-section"><div class="rol-section-title">Timing</div>' + rangeRow('rol-poll','Poll interval','pollInterval',1000,30000,1000,'s') + rangeRow('rol-tdur','Toast duration','toastDuration',3000,30000,1000,'s') + rangeRow('rol-thov','Toast hover delay','toastHoverDelay',1000,10000,500,'s') + '</div>' +
            blHtml +
            '<div class="rol-section"><div class="rol-section-title">Info</div>' +
            '<div class="rol-info-row"><span class="rol-info-label">Items loaded</span><span class="rol-info-val">' + Object.keys(koromonsItems).length.toLocaleString() + '</span></div>' +
            '<div class="rol-info-row"><span class="rol-info-label">Trades seen</span><span class="rol-info-val">' + seen.size + '</span></div>' +
            '</div><div class="rol-section"><button class="rol-reset" id="rol-reset">Reset to Defaults</button></div></div>';

        document.body.appendChild(p);
        p.querySelector('.rol-x').addEventListener('click', closeCreditsPanel);
        p.querySelector('#rol-snd').addEventListener('change', function() { setSetting('sound', this.checked); });
        p.querySelector('#rol-desk').addEventListener('change', function() { setSetting('desktop', this.checked); });
        p.querySelector('#rol-toast').addEventListener('change', function() { setSetting('toast', this.checked); });
        p.querySelector('#rol-spam').addEventListener('change', function() { setSetting('spamProtection', this.checked); });
        p.querySelector('#rol-compact').addEventListener('change', function() { setSetting('compactMode', this.checked); });
        p.querySelector('#rol-auto-decline-blacklist').addEventListener('change', function() { setSetting('autoDeclineBlacklist', this.checked); });
        p.querySelector('#rol-auto-decline-blocked').addEventListener('change', function() { setSetting('autoDeclineBlocked', this.checked); });
        p.querySelector('#rol-spam-threshold').addEventListener('input', function() { const v=parseInt(this.value); document.getElementById('rol-spam-threshold-val').textContent=v; });
        p.querySelector('#rol-spam-threshold').addEventListener('change', function() { setSetting('spamThreshold', parseInt(this.value)); });
        p.querySelector('#rol-spam-window').addEventListener('input', function() { const v=parseInt(this.value); document.getElementById('rol-spam-window-val').textContent=(v/60000)+'m'; });
        p.querySelector('#rol-spam-window').addEventListener('change', function() { setSetting('spamTimeWindow', parseInt(this.value)); });
        p.querySelector('#rol-poll').addEventListener('input', function() { const v=parseInt(this.value); document.getElementById('rol-poll-val').textContent=(v/1000)+'s'; });
        p.querySelector('#rol-poll').addEventListener('change', function() { setSetting('pollInterval', parseInt(this.value)); restartPolling(); });
        p.querySelector('#rol-tdur').addEventListener('input', function() { document.getElementById('rol-tdur-val').textContent=(parseInt(this.value)/1000)+'s'; });
        p.querySelector('#rol-tdur').addEventListener('change', function() { setSetting('toastDuration', parseInt(this.value)); });
        p.querySelector('#rol-thov').addEventListener('input', function() { document.getElementById('rol-thov-val').textContent=(parseInt(this.value)/1000)+'s'; });
        p.querySelector('#rol-thov').addEventListener('change', function() { setSetting('toastHoverDelay', parseInt(this.value)); });
        p.querySelectorAll('.bl-unblock').forEach(btn => btn.addEventListener('click', () => { unblockUser(parseInt(btn.dataset.uid)); closeCreditsPanel(); showCreditsPanel(); }));

        // Blocked users panel button
        const blShowPanelBtn = p.querySelector('#bl-show-panel-btn');
        console.log('Blocked users panel button:', blShowPanelBtn);
        if (blShowPanelBtn) {
            console.log('Adding click listener to blocked users button');
            blShowPanelBtn.addEventListener('click', async (e) => {
                console.log('BLOCKED USERS BUTTON CLICKED!');
                e.preventDefault();
                e.stopPropagation();
                closeCreditsPanel();
                try {
                    console.log('Calling showBlockedUsersPanel...');
                    await showBlockedUsersPanel();
                    console.log('Panel should be visible now');
                } catch (err) {
                    console.error('Error showing blocked users panel:', err);
                }
            });
        } else {
            console.error('Blocked users panel button NOT FOUND!');
        }
        const blCount = document.getElementById('rol-bl-count');
        const blPreview = document.getElementById('rol-bl-preview');
        if (blCount) blCount.textContent = blacklistedItems.size;

        // Fetch and display user greeting
        const userGreeting = document.getElementById('rol-user-name');
        const userAvatar = document.getElementById('rol-user-avatar');
        if (userGreeting) {
            getMyUserId().then(async uid => {
                if (uid) {
                    try {
                        const u = await apiGet(BASE + '/apisite/users/v1/users/' + uid, true);
                        if (u && u.displayName) {
                            userGreeting.textContent = 'Hi, ' + u.displayName;
                            // Fetch avatar
                            const heads = await fetchHeads([uid]);
                            if (userAvatar && heads[uid]) {
                                userAvatar.src = heads[uid];
                                userAvatar.style.display = 'block';
                            }
                        }
                    } catch(e) { console.error('User fetch error:', e); }
                }
            }).catch(() => {});
        }





        // Fetch thumbnails for blacklisted items
        const blArray = [...blacklistedItems].slice(0, 5);
        if (blArray.length > 0) {
            fetchAssetThumbs(blArray).then(() => {
                if (blPreview) {
                    blPreview.style.display = 'flex';
                    blPreview.innerHTML = blArray.map((assetId, idx) => {
                        const thumb = assetThumbs[assetId] || ITEM_FB;
                        return '<div style="width:28px;height:28px;border-radius:50%;overflow:hidden;background:#1a1a1a;flex-shrink:0;border:2px solid #393b3d;margin-left:' + (idx > 0 ? '-10px' : '0') + ';position:relative;z-index:' + (5 - idx) + '">' +
                        '<img src="' + thumb + '" style="width:100%;height:100%;object-fit:cover">' +
                        '</div>';
                    }).join('');
                }
            });
        } else if (blPreview) {
            blPreview.style.display = 'none';
        }

        p.querySelector('#rol-manage-blacklist').addEventListener('click', () => { closeCreditsPanel(); showBlacklistPanel(); });
        p.querySelector('#rol-reset').addEventListener('click', () => { settings = Object.assign({}, defaultSettings); saveSettings(); closeCreditsPanel(); showCreditsPanel(); restartPolling(); });

        // Add info icon listeners - make the ENTIRE label clickable
        const infoTriggers = p.querySelectorAll('.rol-info-trigger');
        console.log('Found info triggers:', infoTriggers.length);
        infoTriggers.forEach((el, index) => {
            console.log('Setting up trigger', index, ':', el.dataset.title);
            el.style.cursor = 'help';
            el.style.position = 'relative';
            el.style.userSelect = 'none';

            // Make the whole thing clickable
            el.addEventListener('click', function(e) {
                console.log('CLICKED!', el.dataset.title);
                e.preventDefault();
                e.stopPropagation();
                showInfoModal(el.dataset.title, el.dataset.desc);
            });

            // Also add to the icon specifically
            const icon = el.querySelector('.rol-info-icon');
            if (icon) {
                icon.style.cursor = 'pointer';
                icon.addEventListener('click', function(e) {
                    console.log('Icon CLICKED directly!');
                    e.preventDefault();
                    e.stopPropagation();
                    showInfoModal(el.dataset.title, el.dataset.desc);
                });
            }
        });

    }

    function closeCreditsPanel() {
        const p = document.getElementById('rol-panel'); if (p) { p.classList.add('rol-out'); setTimeout(() => p.remove(), 200); }
        const ov = document.getElementById('coop-ov'); if (ov) { ov.classList.add('cov-out'); setTimeout(() => ov.remove(), 200); }
    }

    function restartPolling() { if (pollTimer) clearInterval(pollTimer); pollTimer = setInterval(poll, settings.pollInterval); }

    function togglePanel() { panelOpen = !panelOpen; if (panelOpen) { renderPanel(); refreshPanel(); } else closePanel(); }
    function closePanel() {
        panelOpen = false;
        const p = document.getElementById('tp'); if (p) { p.classList.add('tp-out'); setTimeout(() => p.remove(), 200); }
        const o = document.getElementById('to'); if (o) { o.classList.add('to-out'); setTimeout(() => o.remove(), 200); }
    }

    async function refreshPanel() {
        if (!panelOpen) return;
        try {
            panelTrades = await fetchInbound();
            if (panelTrades.length) {
                const uids = [...new Set(panelTrades.map(t => t.user.id))];
                Object.assign(panelHeads, await fetchHeads(uids));
                const allAssetIds = [];
                for (const t of panelTrades) {
                    if (!panelDetails[t.id]) try { panelDetails[t.id] = await fetchDetail(t.id); } catch {}
                    if (panelDetails[t.id]) { const ids = collectAssetIds(panelDetails[t.id]); for (const id of ids) if (!allAssetIds.includes(id)) allAssetIds.push(id); }
                }
                if (allAssetIds.length) await fetchAssetThumbs(allAssetIds);
            }
            for (const id of Object.keys(panelDetails).map(Number)) if (!panelTrades.some(t => t.id === id)) delete panelDetails[id];
        } catch {}
        renderPanelContent();
    }

    function renderPanel() {
        injectCss();
        if (document.getElementById('tp')) return;
        const o = document.createElement('div'); o.id = 'to'; o.addEventListener('click', closePanel); document.body.appendChild(o);
        const p = document.createElement('div'); p.id = 'tp';
        p.innerHTML = '<div class="tp-h"><div class="tp-hl"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" stroke-width="2"><path d="M7 16V4L3 8m4-4l4 4M17 8v12l4-4m-4 4l-4-4"/></svg><span class="tp-t">Inbound Trades</span></div><div class="tp-hr"><button class="tp-decline-all" id="tp-decline-all">Decline All</button><a href="' + BASE + '/My/Trades.aspx" class="tp-link">Open Trades Page</a><span class="tp-x">✕</span></div></div><div id="tp-b" class="tp-b"><div class="tp-ld">Loading trades...</div></div>';
        document.body.appendChild(p);
        p.querySelector('.tp-x').addEventListener('click', closePanel);
        p.querySelector('#tp-decline-all').addEventListener('click', async (e) => {
            e.preventDefault();
            if (!panelTrades.length) return;
            const count = panelTrades.length;
            showConfirm(
                'WARNING: YOU ARE ABOUT TO DECLINE ' + count + ' TRADE' + (count > 1 ? 'S' : '') + '\n\nAre you sure?',
                async () => {
                    const btn = document.getElementById('tp-decline-all');
                    if (btn) { btn.disabled = true; btn.textContent = 'Declining...'; }
                    let declined = 0;
                    for (const t of panelTrades) {
                        try {
                            await apiPost(EP_DETAIL + '/' + t.id + '/decline', {});
                            declined++;
                        } catch {}
                    }
                    if (btn) { btn.textContent = 'Declined ' + declined; setTimeout(() => { btn.disabled = false; btn.textContent = 'Decline All'; }, 2000); }
                    setTimeout(refreshPanel, 1000);
                }
            );
        });
    }

    function renderPanelContent() {
        const b = document.getElementById('tp-b');
        if (!b) return;
        if (!panelTrades.length) { b.innerHTML = '<div class="tp-e"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg><span>No inbound trades right now</span></div>'; return; }
        const fb = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23222%22 width=%221%22 height=%221%22/></svg>";
        const expandedTrades = new Set();
        b.querySelectorAll('.tp-details.tp-open').forEach(el => { const card = el.closest('.tp-c'); if (card?.dataset.t) expandedTrades.add(parseInt(card.dataset.t)); });

        let h = '';
        for (const t of panelTrades) {
            const det = panelDetails[t.id], img = panelHeads[t.user.id] || fb;
            const { sending, receiving } = splitOffers(det, t.user.id);
            const history = getUserHistory(t.user.id);
            let histBadge = history?.trades.length > 0 ? '<button class="tp-history-btn" data-uid="' + t.user.id + '" data-username="' + esc(t.user.displayName) + '">' + history.trades.length + '</button>' : '';

            let dh = '', sum = '';
            if (det && Array.isArray(det.offers)) {
                const sv = offerTotals(sending), rv = offerTotals(receiving);
                const vd = sv.tv - rv.tv, rd = sv.tr - rv.tr;
                const s = summaryHtml(det, t.user.id);
                let warningIcon = '';
                if (vd < -1000 || rd < -1000) {
                    let msg = 'WARNING: Big loss!\\n'; if (vd < -1000) msg += 'Value Loss: ' + Math.abs(vd).toLocaleString() + '\\n'; if (rd < -1000) msg += 'RAP Loss: ' + Math.abs(rd).toLocaleString();
                    warningIcon = '<div class="tp-warning-icon" data-warning="' + esc(msg) + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>';
                }
                dh = warningIcon + '<div class="tp-of-combined"><div class="to-section"><div class="to-l">Items you will give</div>' + offerHtml(receiving) + '</div><div class="tp-middle">' + s + '</div><div class="to-section"><div class="to-l">Items you will receive</div>' + offerHtml(sending) + '</div></div>';

                // value indicator (no background, just the numbers)
                let topV = rv.tv || rv.tr || 0, botV = sv.tv || sv.tr || 0;
                let barClass = vd < -100 || rd < -100 ? 'tp-indicator-red' : vd > 100 || rd > 100 ? 'tp-indicator-green' : 'tp-indicator-gray';
                sum = '<div class="tp-indicator ' + barClass + '"><div class="tp-indicator-top">' + topV.toLocaleString() + '</div><div class="tp-indicator-bottom">' + botV.toLocaleString() + '</div></div>';
            }

            const isExpanded = expandedTrades.has(t.id);
            h += '<div class="tp-c" data-t="' + t.id + '">' +
                '<div class="tp-ct tp-clickable">' +
                '<img src="' + img + '" onerror="this.src=\'' + fb + '\'" class="tp-av">' +
                '<div class="tp-ci"><div class="tp-cn">' + esc(t.user.displayName) + histBadge + '</div><div class="tp-cm">#' + t.id + ' \xB7 ' + ago(t.created) + ' \xB7 expires ' + until(t.expiration) + '</div></div>' +
                sum + '</div>' +
                '<div class="tp-details' + (isExpanded ? ' tp-open' : '') + '">' + dh + actionsHtml(t.id, t.user.id, 'tp') + '</div></div>';
        }
        b.innerHTML = h;
        bindActions(b);
        b.querySelectorAll('.tp-clickable').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); el.closest('.tp-c').querySelector('.tp-details').classList.toggle('tp-open'); }));
    }

    function sendNotify(trade, img, det) {
        if (!settings.desktop && !settings.sound && !settings.toast) return;
        const { sending, receiving } = splitOffers(det, trade.user.id);
        const sv = offerTotals(sending), rv = offerTotals(receiving);
        const body = 'Partner - ' + trade.user.displayName + '\nYour RAP - ' + (rv.tr||0).toLocaleString() + '\nTheir RAP - ' + (sv.tr||0).toLocaleString();
        if (settings.sound) playSound();
        if (settings.desktop) {
            if (typeof GM_notification === 'function') GM_notification({ title: 'Trade Notifier', text: body, image: img || undefined, timeout: 8000, onclick() { window.focus(); if (!panelOpen) togglePanel(); } });
            else if (Notification.permission === 'granted') { const n = new Notification('Trade Notifier', { body, icon: img || undefined }); n.onclick = () => { window.focus(); if (!panelOpen) togglePanel(); }; }
        }
    }

    function injectCss() {
        if (document.getElementById('ts')) return;
        const s = document.createElement('style'); s.id = 'ts';
        s.textContent =
'#tn-c{position:fixed;top:16px;right:16px;z-index:999997;display:flex;flex-direction:column;gap:8px;pointer-events:none}' +
'.nt{pointer-events:auto;animation:ni .2s ease;max-width:440px;min-width:360px;width:420px;padding:0}.nt.nout{animation:nout .2s ease forwards}' +
'.nt.nt-compact{max-width:320px;min-width:280px;width:300px}' +
'.nt-inner{display:flex;gap:12px;background:#393b3d;border-radius:4px;padding:12px;font-family:"Gotham SSm","Gotham",sans-serif;font-size:13px;box-shadow:0 2px 4px rgba(0,0,0,.3)}' +
'.nt-av{width:48px;height:48px;border-radius:50%;flex-shrink:0;object-fit:cover;background:#2b2d2f}' +
'.nt-b{display:flex;flex-direction:column;gap:4px;min-width:0;overflow:hidden;flex:1}' +
'.nt-t{font-weight:700;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
'.nm{color:#b8b8b8;font-size:12px}' +
'.nt-exp{max-height:0;overflow:hidden;opacity:0;transition:max-height .3s ease,opacity .2s ease,margin .2s ease}.nt:hover .nt-exp{max-height:800px;opacity:1;margin-top:8px}' +
'.nt-acts{display:flex;gap:4px;margin-top:8px;max-height:0;overflow:hidden;opacity:0;transition:max-height .2s,opacity .2s}.nt:hover .nt-acts{max-height:50px;opacity:1}' +
'.ta-compact{display:flex;align-items:center;gap:6px;padding:3px;border-bottom:1px solid #2b2d2f}.ta-compact:last-child{border-bottom:none}' +
'.ta-img-compact{width:32px;height:32px;border-radius:3px;object-fit:contain;background:#2b2d2f;flex-shrink:0}' +
'.ta-body-compact{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}' +
'.ta-n-compact{font-size:10px;color:#fff;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
'.ta-robux-icon-compact{width:32px;height:32px;border-radius:3px;background:#2b2d2f;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#00a152}' +
'.sum-compact{display:flex;justify-content:center;margin-top:6px;padding:4px 8px;border-radius:3px;font-size:10px;font-weight:700}' +
'.sum-compact-win{color:#00a152}.sum-compact-loss{color:#ff4444}.sum-compact-even{color:#b8b8b8}' +
'.tp-history-btn{margin-left:8px;padding:3px 8px;background:#0074bd;color:#fff;border:none;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer}' +
'#history-ov{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:10000001;animation:fi .2s ease}' +
'#history-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:420px;max-height:80vh;background:#393b3d;border-radius:4px;z-index:10000002;display:flex;flex-direction:column;box-shadow:0 4px 8px rgba(0,0,0,.4);font-family:"Gotham SSm","Gotham",sans-serif}' +
'.hist-h{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:2px solid #2b2d2f;background:#2b2d2f}' +
'.hist-title{font-size:14px;font-weight:700;color:#fff}.hist-x{color:#b8b8b8;font-size:18px;cursor:pointer;padding:4px 8px;font-weight:700}.hist-x:hover{color:#fff}' +
'.hist-body{padding:12px;overflow-y:auto;max-height:60vh}.hist-body::-webkit-scrollbar{width:8px}.hist-body::-webkit-scrollbar-track{background:#2b2d2f}.hist-body::-webkit-scrollbar-thumb{background:#1a1a1a}' +
'.hist-item{background:#2b2d2f;border-radius:4px;padding:10px;margin-bottom:8px}' +
'.hist-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}' +
'.hist-accepted{color:#00a152;font-weight:700;font-size:11px;padding:3px 6px;background:rgba(0,161,82,.15);border-radius:3px}' +
'.hist-declined{color:#ff4444;font-weight:700;font-size:11px;padding:3px 6px;background:rgba(255,68,68,.15);border-radius:3px}' +
'.hist-blocked{color:#ff6b00;font-weight:700;font-size:11px;padding:3px 6px;background:rgba(255,107,0,.15);border-radius:3px}' +
'.hist-time{color:#b8b8b8;font-size:10px}.hist-id{color:#0074bd;font-size:11px;font-weight:700;margin-bottom:4px}' +
'.hist-details{color:#b8b8b8;font-size:10px;line-height:1.4;white-space:pre-wrap}.hist-empty{color:#666;text-align:center;padding:40px 0;font-size:12px}' +
'.items-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;padding:8px 0}' +
'.grid-item{background:#2b2d2f;border:1px solid #393b3d;border-radius:4px;padding:8px;display:flex;flex-direction:column;height:140px;max-width:120px}' +
'.grid-item:hover{background:#393b3d;border-color:#0074bd;transform:translateY(-2px)}' +
'.grid-item-img-wrapper{width:100%;height:80px;position:relative;background:#1a1a1a;border-radius:4px;margin-bottom:6px;overflow:hidden;flex-shrink:0}' +
'.grid-item-img{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);max-width:100%;max-height:100%;object-fit:contain}' +
'.grid-item-name{font-size:10px;color:#fff;font-weight:600;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}' +
'.grid-item-tags{display:flex;gap:3px;margin-top:4px;flex-wrap:wrap;justify-content:center;overflow:hidden;max-height:20px}' +
'.grid-tag{font-size:9px;padding:2px 5px;border-radius:3px;font-weight:700;white-space:nowrap;color:#fff}' +
'.grid-item-robux{background:#2d3a2f;border-color:#00a152}.grid-robux-icon{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;color:#00a152}' +
'.ts-grid{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;padding-top:8px;border-top:1px solid #2b2d2f}' +
'.ta{display:flex;align-items:center;gap:8px;padding:4px;border-bottom:1px solid #2b2d2f}.ta:last-child{border-bottom:none}.ta:hover{background:#2b2d2f}' +
'.ta-img{width:48px;height:48px;border-radius:4px;object-fit:contain;background:#2b2d2f;flex-shrink:0}' +
'.ta-body{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.ta-n{font-size:13px;color:#fff;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ta-t{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}' +
'.ta-robux-icon{width:48px;height:48px;border-radius:4px;background:#2b2d2f;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#00a152}' +
'.tt{font-size:15px;padding:3px 6px;border-radius:3px;font-weight:700;white-space:nowrap;color:#fff}.tt-v,.tt-r{background:transparent}.tt-s{color:#00a152;background:#2b2d2f}' +
'.trx{color:#00a152}.trx-t{color:#00a152;background:#2b2d2f}.te{color:#666;font-size:12px;font-style:italic;padding:8px 0}' +
'.sum-diffs-only{display:inline-flex;gap:6px;flex-wrap:wrap}' +
'.dt{font-size:15px;font-weight:700;background:transparent}.dt-w{color:#00a152}.dt-l{color:#ff4444}.dt-e{color:#b8b8b8}' +
'.to-s{margin-bottom:8px;padding:8px;border-radius:4px;background:#393b3d}.to-s:last-child{margin-bottom:0}' +
'.tp-of-combined{background:#393b3d;border-radius:4px;padding:12px;margin-top:8px}.to-section{margin-bottom:8px}' +
'.to-l{font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #2b2d2f;color:#fff}' +
'.ab{padding:8px 12px;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:"Gotham SSm","Gotham",sans-serif;flex:1;text-align:center;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}' +
'.ab:hover{filter:brightness(1.15)}.ab-a{background:#00a152;color:#fff}.ab-c{background:#0074bd;color:#fff}.ab-d{background:#ff4444;color:#fff}.ab-b{background:#ff6b00;color:#fff}.ab-i{background:#393b3d;color:#b8b8b8}' +
'.as{font-size:11px;display:flex;align-items:center;justify-content:center;width:100%;padding:8px 0;border-radius:3px;font-weight:700}' +
'.as-w{color:#ffd500;background:#2b2d2f}.as-ok{color:#00a152;background:#2b2d2f}.as-er{color:#ff4444;background:#2b2d2f}' +
'#tn-b{display:flex;align-items:center;list-style:none;margin:0 6px}' +
'#tn-ba{display:flex;align-items:center;gap:5px;text-decoration:none;color:#b8b8b8;cursor:pointer}.#tn-ba:hover{color:#fff}' +
'#tn-bc{background:#ff4444;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:16px;text-align:center;line-height:1.4}' +
'#to{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:999998;animation:fi .2s ease}#to.to-out{animation:fo .2s ease forwards}' +
'#tp{position:fixed;top:50%;right:24px;transform:translateY(-50%);width:500px;max-height:85vh;background:#393b3d;border-radius:4px;z-index:999999;display:flex;flex-direction:column;box-shadow:0 4px 8px rgba(0,0,0,.4);font-family:"Gotham SSm","Gotham",sans-serif;animation:pi .2s ease}#tp.tp-out{animation:po .2s ease forwards}' +
'.tp-h{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:2px solid #2b2d2f;background:#2b2d2f}' +
'.tp-hl{display:flex;align-items:center;gap:8px}.tp-t{font-size:15px;font-weight:700;color:#fff}.tp-hr{display:flex;align-items:center;gap:8px}' +
'.tp-link{font-size:11px;color:#fff;font-weight:700;text-decoration:none;padding:6px 12px;border-radius:3px;background:#0074bd}.tp-link:hover{background:#0088e0}' +
'.tp-b{overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#393b3d}' +
'.tp-b::-webkit-scrollbar{width:8px}.tp-b::-webkit-scrollbar-track{background:#2b2d2f}.tp-b::-webkit-scrollbar-thumb{background:#1a1a1a}' +
'.tp-e{color:#666;text-align:center;padding:40px 0;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:12px}' +
'.tp-ld{color:#b8b8b8;text-align:center;padding:40px 0;font-size:13px;font-weight:700}' +
'.tp-c{background:#2b2d2f;border-radius:4px;padding:12px}.tp-c:hover{background:#2d2f2b}' +
'.tp-ct{display:flex;gap:10px;align-items:center}.tp-clickable{cursor:pointer;flex:1}.tp-clickable:hover{background:rgba(255,255,255,.05);border-radius:4px;padding:4px;margin:-4px}' +
'.pkr-indicator{position:absolute;top:50%;right:8px;transform:translateY(-50%);display:flex;flex-direction:column;align-items:flex-end;min-width:70px;border-radius:4px;padding:6px 8px;z-index:10}' +
'.pkr-indicator-green{background:rgba(0,161,82,.2);border-left:4px solid #00a152}' +
'.pkr-indicator-red{background:rgba(255,68,68,.2);border-left:4px solid #ff4444}' +
'.pkr-indicator-gray{background:rgba(136,136,136,.2);border-left:4px solid #888}' +
'.pkr-indicator-top{font-size:14px;font-weight:700;color:#fff;line-height:1.2}.pkr-indicator-bottom{font-size:13px;font-weight:600;color:#b8b8b8;line-height:1.2}' +
'.tp-details{overflow:hidden;max-height:0;opacity:0;transition:max-height .4s ease,opacity .3s ease,margin .3s ease;position:relative}.tp-details.tp-open{max-height:2000px;opacity:1;margin-top:12px}' +
'.tp-x{color:#b8b8b8;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:3px;font-weight:700}.tp-x:hover{color:#fff;background:#2b2d2f}' +
'.tp-av{width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#393b3d}.tp-ci{flex:1;min-width:0}' +
'.tp-cn{font-size:14px;font-weight:700;color:#fff;margin-bottom:2px}.tp-cm{color:#b8b8b8;font-size:11px}.tp-of{margin-top:8px}' +
'.tp-middle{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;padding:6px 8px}' +
'.tp-acts{display:flex;gap:4px;margin-top:10px;padding-top:10px;border-top:1px solid #393b3d}' +
'.tp-ft{text-align:center;padding:10px 0;border-top:2px solid #2b2d2f;background:#2b2d2f;color:#b8b8b8;font-size:11px}.tp-ft a{color:#0074bd;text-decoration:none;font-weight:700}' +
'#tc{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:10000000;display:flex;align-items:center;justify-content:center;animation:fi .15s ease}' +
'.tc-b{background:#393b3d;border:2px solid #2b2d2f;border-radius:4px;padding:24px;min-width:360px;max-width:480px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.5)}' +
'.tc-i{margin-bottom:16px;display:flex;justify-content:center}.tc-m{color:#fff;font-size:14px;margin-bottom:24px;line-height:1.6;font-weight:600;white-space:pre-line}.tc-f{display:flex;gap:8px;justify-content:center}' +
'.tc-y{padding:10px 24px;border:2px solid #00a152;border-radius:3px;background:#00a152;color:#fff;font-weight:700;font-size:12px;cursor:pointer;min-width:100px}.tc-y:hover{background:#00ba5e}' +
'.tc-n{padding:10px 24px;border:2px solid #fff;border-radius:3px;background:transparent;color:#fff;font-weight:700;font-size:12px;cursor:pointer;min-width:100px}.tc-n:hover{background:rgba(255,255,255,.1)}' +
'#coop-ov{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:999998;animation:fi .2s ease}#coop-ov.cov-out{animation:fo .2s ease forwards}' +
'#rol-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;background:#393b3d;border-radius:4px;z-index:999999;display:flex;flex-direction:column;box-shadow:0 4px 8px rgba(0,0,0,.4);font-family:"Gotham SSm","Gotham",sans-serif;animation:cpi .2s ease;max-height:90vh}#rol-panel.rol-out{animation:cpo .2s ease forwards}' +
'.rol-h{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:2px solid #2b2d2f;background:#2b2d2f}' +
'.rol-hl{display:flex;align-items:center;gap:8px}.rol-title{font-size:15px;font-weight:700;color:#fff}.rol-ver{font-size:10px;color:#b8b8b8;background:#393b3d;padding:3px 6px;border-radius:3px;font-weight:700}' +
'.rol-x{color:#b8b8b8;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:3px;font-weight:700}.rol-x:hover{color:#fff;background:#2b2d2f}' +
'.rol-body{padding:16px;overflow-y:auto;max-height:70vh}.rol-body::-webkit-scrollbar{width:8px}.rol-body::-webkit-scrollbar-track{background:#2b2d2f}.rol-body::-webkit-scrollbar-thumb{background:#1a1a1a}' +
'.rol-section{margin-bottom:20px}.rol-section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#b8b8b8;margin-bottom:8px;border-bottom:1px solid #2b2d2f;padding-bottom:4px}' +
'.cr-list{display:flex;flex-direction:column;gap:6px}.cr-card{display:flex;gap:10px;padding:10px;background:#2b2d2f;border-radius:4px;text-decoration:none}.cr-card:hover{background:#393b3d}' +
'.cr-av{width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#393b3d}.cr-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}' +
'.cr-name{font-size:14px;font-weight:700;color:#fff}.cr-meta{display:flex;align-items:center;gap:6px}.cr-role{font-size:10px;font-weight:700;padding:3px 6px;border-radius:3px}.cr-id{font-size:10px;color:#b8b8b8}.cr-desc{font-size:11px;color:#b8b8b8;margin-top:2px}' +
'.rol-toggle-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0}' +
'.rol-toggle-label{font-size:12px;color:#fff;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}' +
'.rol-switch{position:relative;display:inline-block;width:44px;height:24px}.rol-switch input{opacity:0;width:0;height:0}' +
'.rol-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#2b2d2f;border-radius:12px;transition:.2s}' +
'.rol-slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background:#ffffff;border-radius:50%;transition:.2s}' +
'.rol-switch input:checked+.rol-slider{background:#0074bd}' +
'.rol-switch input:checked+.rol-slider:before{transform:translateX(20px);background:#ffffff}' +
'.rol-switch input:checked+.rol-slider{background:#0074bd}.rol-switch input:checked+.rol-slider:before{transform:translateX(20px);background:#ffffff}.rol-range-label{font-size:12px;color:#fff;font-weight:700}.rol-range-val{font-size:11px;color:#0074bd;font-weight:700}' +
'.rol-range{width:100%;height:6px;-webkit-appearance:none;appearance:none;background:#2b2d2f;border-radius:3px;outline:none;cursor:pointer}.rol-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#ffffff;cursor:pointer}' +
'.rol-info-row{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #2b2d2f}.rol-info-label{color:#b8b8b8}.rol-info-val{color:#fff;font-weight:700}' +
'.rol-reset{width:100%;padding:10px 0;border:none;border-radius:3px;background:#2b2d2f;color:#fff;font-size:12px;font-weight:700;cursor:pointer}.rol-reset:hover{background:#393b3d}' +
'.bl-list{display:flex;flex-direction:column;gap:6px}.bl-item{display:flex;justify-content:space-between;align-items:center;padding:8px;background:#2b2d2f;border-radius:4px}' +
'.bl-user-info{display:flex;align-items:center;gap:10px}' +
'.bl-av{width:36px;height:36px;border-radius:50%;object-fit:cover;background:#393b3d;flex-shrink:0}' +
'.bl-profile-link{flex-shrink:0;display:flex}' +
'.bl-user-details{display:flex;flex-direction:column;gap:2px}' +
'.bl-name-link{font-size:13px;color:#fff;font-weight:700;text-decoration:none}.bl-name-link:hover{color:#4fc3f7;text-decoration:underline}' +
'.bl-id{font-size:10px;color:#b8b8b8}' +
'.bl-unblock,.bl-unblock-full{padding:8px 16px;border:none;border-radius:4px;background:#0074bd;color:#fff;font-size:12px;font-weight:700;cursor:pointer;transition:background .15s}.bl-unblock:hover,.bl-unblock-full:hover{background:#0090e0}' +
'.bl-empty{font-size:12px;color:#b8b8b8;text-align:center;padding:16px 0;font-weight:700}' +
'.tp-decline-all{padding:6px 12px;border:none;border-radius:3px;background:#ff4444;color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none}.tp-decline-all:hover{background:#ff6666}' +

// MASS TRADE PANEL CSS
'#mass-trade-ov{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:999998;animation:fi .2s ease}' +
'#mass-trade-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;max-width:95vw;max-height:90vh;background:#1a1a1a;border-radius:8px;z-index:999999;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.6);font-family:"Gotham SSm","Gotham",sans-serif;overflow:hidden;animation:cpi .2s ease}' +
'.mt-h{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:2px solid #2b2d2f;background:#111}' +
'.mt-hl{display:flex;align-items:center;gap:8px}.mt-title{font-size:16px;font-weight:700;color:#fff}' +
'.mt-x{color:#b8b8b8;font-size:20px;cursor:pointer;padding:4px 8px;font-weight:700;border-radius:4px}.mt-x:hover{color:#fff;background:#2b2d2f}' +
'.mt-tabs{display:flex;gap:4px;padding:0 16px;border-bottom:2px solid #2b2d2f;background:#111}' +
'.mt-tab{flex:1;padding:12px;background:none;border:none;color:#b8b8b8;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border-bottom:3px solid transparent;transition:all .15s}.mt-tab:hover{color:#fff;background:rgba(255,255,255,.05)}' +
'.mt-tab-active{color:#4fc3f7;border-bottom-color:#4fc3f7}' +
'.mt-mode-content{display:flex;flex-direction:column;gap:16px}' +
'.mt-body{padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;max-height:calc(90vh - 60px)}' +
'.mt-body::-webkit-scrollbar{width:8px}.mt-body::-webkit-scrollbar-track{background:#111}.mt-body::-webkit-scrollbar-thumb{background:#2b2d2f;border-radius:4px}' +
'.mt-step{background:#232323;border-radius:6px;padding:14px}' +
'.mt-step-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#b8b8b8;margin-bottom:10px}' +
'.mt-count{color:#4fc3f7;font-weight:700}' +
'.mt-row{display:flex;gap:8px;align-items:center}' +
'.mt-input{flex:1;height:36px;padding:0 12px;background:#111;border:1px solid #2b2d2f;border-radius:6px;color:#fff;font-size:13px;font-family:inherit;outline:none;transition:border-color .2s}.mt-input:focus{border-color:#4fc3f7}' +
'.mt-btn{padding:8px 16px;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;display:inline-flex;align-items:center;gap:6px}' +
'.mt-btn-blue{background:#0074bd;color:#fff}.mt-btn-blue:hover{background:#0088e0}' +
'.mt-btn-green{background:#00a152;color:#fff;width:100%;justify-content:center;padding:12px}.mt-btn-green:hover:not(:disabled){background:#00ba5e;transform:translateY(-1px)}' +
'.mt-btn-green:disabled{opacity:.4;cursor:not-allowed}' +
'.mt-send-btn{margin-top:8px;font-size:14px}' +
'.mt-user-info{display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px;background:#111;border-radius:6px;border:1px solid #2b2d2f}' +
'.mt-username{font-size:14px;font-weight:700;color:#fff}.mt-uid-badge{font-size:11px;color:#b8b8b8;background:#2b2d2f;padding:2px 8px;border-radius:3px}' +
'.mt-placeholder{color:#666;text-align:center;padding:30px 0;font-size:13px}' +
'.mt-items-grid-wrap{max-height:220px;overflow-y:auto;margin-top:4px}.mt-items-grid-wrap::-webkit-scrollbar{width:6px}.mt-items-grid-wrap::-webkit-scrollbar-track{background:#111}.mt-items-grid-wrap::-webkit-scrollbar-thumb{background:#2b2d2f;border-radius:3px}' +
'.mt-items-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:6px}' +
'.mt-item-card{background:#111;border:1px solid #2b2d2f;border-radius:6px;padding:6px;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px}' +
'.mt-item-card:hover{border-color:#4fc3f7;transform:translateY(-2px)}' +
'.mt-item-card.mt-item-sel{border-color:#00a152!important;background:#1a2a1a!important;box-shadow:0 0 0 1px #00a152}' +
'.mt-item-card.mt-item-maxed{opacity:.25;cursor:not-allowed;pointer-events:none}' +
'.mt-item-img-wrap{width:70px;height:70px;background:#1a1a1a;border-radius:4px;overflow:hidden;flex-shrink:0}' +
'.mt-item-img-wrap img{width:100%;height:100%;object-fit:contain}' +
'.mt-item-name{font-size:9px;color:#fff;font-weight:600;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%}' +
'.mt-item-tags{display:flex;gap:2px;flex-wrap:wrap;justify-content:center}' +
'.mt-tag{font-size:8px;padding:1px 4px;border-radius:2px;font-weight:700;color:#fff}' +
'.mt-tag-v{background:rgba(244,114,182,.2);color:#f472b6}.mt-tag-r{background:rgba(96,165,250,.2);color:#60a5fa}' +
'.mt-value-summary{background:#111;border-radius:6px;padding:12px;border:1px solid #2b2d2f}' +
'.mt-val-row{display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#b8b8b8;border-bottom:1px solid #1a1a1a}.mt-val-row:last-child{border-bottom:none}' +
'.mt-win{color:#00a152!important;font-weight:700}.mt-loss{color:#ff4444!important;font-weight:700}.mt-even{color:#b8b8b8!important}' +
'.mt-log{max-height:120px;overflow-y:auto;margin-top:10px;display:flex;flex-direction:column;gap:4px}.mt-log::-webkit-scrollbar{width:4px}.mt-log::-webkit-scrollbar-thumb{background:#2b2d2f;border-radius:2px}' +
'.mt-log-item{font-size:11px;padding:5px 8px;border-radius:4px;font-weight:600}' +
'.mt-log-info{background:#1a1a2a;color:#4fc3f7}.mt-log-ok{background:#1a2a1a;color:#00a152}.mt-log-err{background:#2a1a1a;color:#ff4444}' +
'.mt-fullw{width:100%;justify-content:center}' +
'.mt-small-btn{width:26px;height:26px;border:1px solid #2b2d2f;background:#111;color:#fff;font-size:14px;font-weight:700;border-radius:4px;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}.mt-small-btn:hover{background:#2b2d2f;border-color:#4fc3f7;color:#4fc3f7}' +
'.mt-max-btn{padding:4px 10px;border:1px solid #2b2d2f;background:#111;color:#b8b8b8;font-size:10px;font-weight:700;border-radius:4px;cursor:pointer;transition:all .15s;white-space:nowrap}.mt-max-btn:hover{background:#2b2d2f;border-color:#4fc3f7;color:#4fc3f7}' +
'.mt-targets-list{display:flex;flex-direction:column;gap:6px;margin-top:4px}' +
'.mt-target-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#111;border-radius:6px;border:1px solid #2b2d2f}' +
'.mt-target-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}' +
'.mt-target-user{font-size:12px;font-weight:700;color:#fff}' +
'.mt-target-item{font-size:10px;color:#b8b8b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
'.mt-ts{font-size:11px;font-weight:700;padding:3px 7px;border-radius:3px;white-space:nowrap;flex-shrink:0}' +
'.mt-ts-loading{color:#b8b8b8;background:#232323}' +
'.mt-ts-ready{color:#00a152;background:rgba(0,161,82,.15)}' +
'.mt-ts-missing{color:#ff4444;background:rgba(255,68,68,.1);font-size:10px}' +
'.mt-ts-sent{color:#4fc3f7;background:rgba(79,195,247,.1)}' +
'.mt-ts-failed{color:#ff4444;background:rgba(255,68,68,.15)}' +
'.mt-remove-btn{background:none;border:none;color:#555;font-size:14px;cursor:pointer;padding:2px 6px;border-radius:3px;flex-shrink:0}.mt-remove-btn:hover{color:#ff4444;background:rgba(255,68,68,.1)}' +
'.mt-warn-banner{background:rgba(255,68,68,.12);border:1px solid rgba(255,68,68,.4);border-radius:6px;padding:10px 14px;font-size:11px;font-weight:700;color:#ff6b6b;text-align:center;letter-spacing:.3px}' +
'.mt-how-wrap{padding:0 2px}' +
'.mt-how-toggle{width:100%;background:none;border:1px solid #2b2d2f;border-radius:6px;color:#b8b8b8;font-size:11px;font-weight:700;padding:8px;cursor:pointer;font-family:inherit;transition:all .15s}.mt-how-toggle:hover{background:#2b2d2f;color:#fff}' +
'.mt-how-box{margin-top:8px;background:#111;border:1px solid #2b2d2f;border-radius:6px;padding:14px;display:flex;flex-direction:column;gap:10px}' +
'.mt-how-title{font-size:12px;font-weight:700;color:#fff;border-bottom:1px solid #2b2d2f;padding-bottom:8px;margin-bottom:2px}' +
'.mt-how-step{display:flex;gap:10px;align-items:flex-start;font-size:11px;color:#b8b8b8;line-height:1.5}' +
'.mt-how-num{flex-shrink:0;width:18px;height:18px;background:#0074bd;color:#fff;font-size:10px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center}' +
'.mt-how-note{font-size:10px;color:#666;background:#1a1a1a;border-radius:4px;padding:6px 10px;border-left:3px solid #2b2d2f}' +
'.mt-full{width:100%;justify-content:center}' +
'.mt-btn-red{background:#ff4444;color:#fff}.mt-btn-red:hover{background:#ff6060}' +
'.mt-sel-info{font-size:10px;color:#b8b8b8;margin-top:6px;padding:4px 8px;background:#111;border-radius:4px}' +
'.mt-blast-info{background:#111;border:1px solid #2b2d2f;border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px}' +
'.mt-blast-row{font-size:12px;color:#fff;display:flex;align-items:center;gap:6px}' +
'.mt-progress{height:6px;background:#111;border-radius:3px;overflow:hidden;margin-top:8px}' +
'.mt-progress-bar{height:100%;background:linear-gradient(90deg,#0074bd,#4fc3f7);border-radius:3px;transition:width .3s;width:0%}' +
'.mt-picker{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:10;display:flex;align-items:center;justify-content:center;border-radius:8px}' +
'.mt-picker-box{background:#232323;border-radius:8px;padding:16px;width:80%;max-height:70%;overflow-y:auto;display:flex;flex-direction:column;gap:8px}' +
'.mt-picker-title{font-size:13px;font-weight:700;color:#fff;border-bottom:1px solid #2b2d2f;padding-bottom:8px;margin-bottom:4px}' +
'.mt-picker-list{display:flex;flex-direction:column;gap:4px}' +
'.mt-picker-item{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#111;border-radius:6px;cursor:pointer;border:1px solid #2b2d2f}' +
'.mt-picker-item:hover{border-color:#4fc3f7;background:#1a1a2a}' +
'.mt-picker-name{font-size:12px;color:#fff;font-weight:600}.mt-picker-id{font-size:10px;color:#b8b8b8}' +

'.tp-indicator{display:flex;flex-direction:column;align-items:center;justify-content:center;width:70px;padding:6px 4px;margin-left:auto;flex-shrink:0;border-radius:4px}' +
'.tp-indicator-green{border-left:4px solid #00a152}' +
'.tp-indicator-red{border-left:4px solid #ff4444}' +
'.tp-indicator-gray{border-left:4px solid #888}' +
'.tp-indicator-top{font-size:14px;font-weight:700;line-height:1.2}' +
'.tp-indicator-bottom{font-size:12px;font-weight:600;color:#b8b8b8;line-height:1.2}' +
'.tp-warning-icon{position:absolute;top:8px;right:8px;z-index:10;cursor:pointer;display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,68,68,.2);border-radius:50%;transition:all .2s}.tp-warning-icon:hover{background:rgba(255,68,68,.3);transform:scale(1.1)}' +
'@keyframes ni{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}' +
'@keyframes nout{to{opacity:0;transform:translateX(30px)}}' +
'@keyframes pi{from{opacity:0;transform:translateY(-50%) translateY(-20px)}to{opacity:1;transform:translateY(-50%) translateY(0)}}' +
'@keyframes po{to{opacity:0;transform:translateY(-50%) translateY(-20px)}}' +
'@keyframes cpi{from{opacity:0;transform:translate(-50%,-50%) translateY(-20px)}to{opacity:1;transform:translate(-50%,-50%) translateY(0)}}' +
'@keyframes cpo{to{opacity:0;transform:translate(-50%,-50%) translateY(-20px)}}' +
'@keyframes fi{from{opacity:0}to{opacity:1}}' +
'@keyframes fo{to{opacity:0}}';
        document.head.appendChild(s);
    }

    function getContainer() {
        let c = document.getElementById('tn-c');
        if (!c) { c = document.createElement('div'); c.id = 'tn-c'; document.body.appendChild(c); }
        return c;
    }

    function showToast(trade, img, det) {
        if (!settings.toast) return;
        injectCss();
        const fb = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23222%22 width=%221%22 height=%221%22/></svg>";
        const { sending, receiving } = splitOffers(det, trade.user.id);
        const compact = settings.compactMode;
        let sum = '', expHtml = '';
        if (det && Array.isArray(det.offers)) {
            sum = summaryHtml(det, trade.user.id, compact);
            if (!compact) expHtml = '<div class="to-s"><div class="to-l">They offer</div>' + offerHtml(sending, compact) + '</div><div class="to-s"><div class="to-l">They want</div>' + offerHtml(receiving, compact) + '</div>';
        }
        const el = document.createElement('div');
        el.className = 'nt' + (compact ? ' nt-compact' : '');
        let timer = null;
        el.innerHTML = '<div class="nt-inner"><img src="' + (img || fb) + '" onerror="this.src=\'' + fb + '\'" class="nt-av"><div class="nt-b"><div class="nt-t">' + esc(trade.user.displayName) + ' sent a trade</div><div class="nm">#' + trade.id + ' \xB7 ' + ago(trade.created) + ' \xB7 expires ' + until(trade.expiration) + '</div>' + (sum||'') + '<div class="nt-exp">' + expHtml + '</div>' + (compact ? '' : actionsHtml(trade.id, trade.user.id, 'nt')) + '</div></div>';
        bindActions(el);
        el.addEventListener('mouseenter', () => { if (timer) { clearTimeout(timer); timer = null; } });
        el.addEventListener('mouseleave', () => { timer = setTimeout(dismiss, settings.toastHoverDelay); });
        getContainer().appendChild(el);
        function dismiss() { el.classList.add('nout'); el.addEventListener('animationend', () => el.remove()); }
        timer = setTimeout(dismiss, settings.toastDuration);
    }

    async function poll() {
        try {
            const allTrades = await fetchInbound();
            // Spam check
            for (const t of allTrades) {
                if (!seen.has(t.id) && !isBlocked(t.user.id)) {
                    if (trackTrade(t.user.id, t.id)) { blockUser(t.user.id, t.user.displayName); try { await apiPost(EP_DETAIL + '/' + t.id + '/decline', {}); } catch {} seen.add(t.id); }
                }
            }
            // Auto-decline blocked
            if (settings.autoDeclineBlocked) {
                for (const t of allTrades) {
                    if (isBlocked(t.user.id) && !seen.has(t.id)) { try { await apiPost(EP_DETAIL + '/' + t.id + '/decline', {}); } catch {} seen.add(t.id); }
                }
            }
            // Auto-decline blacklisted items
            if (settings.autoDeclineBlacklist) {
                for (const t of allTrades) {
                    if (!seen.has(t.id) && !isBlocked(t.user.id)) {
                        const det = panelDetails[t.id] || await fetchDetail(t.id).catch(() => null);
                        if (det && tradeHasBlacklistedItem(det)) {
                            try { await apiPost(EP_DETAIL + '/' + t.id + '/decline', {}); } catch {}
                            seen.add(t.id);
                        }
                    }
                }
            }
            const trades = allTrades.filter(t => !isBlocked(t.user.id));
            updateBadge(await fetchCount());
            const cur = new Set(trades.map(t => t.id));
            let dirty = false;
            for (const id of [...seen]) { if (!cur.has(id)) { seen.delete(id); dirty = true; } }
            const fresh = trades.filter(t => !seen.has(t.id));
            if (fresh.length) {
                const uids = [...new Set(fresh.map(t => t.user.id))];
                const heads = await fetchHeads(uids);
                Object.assign(panelHeads, heads);
                for (const t of fresh) {
                    seen.add(t.id);
                    if (first) continue;
                    let det = null;
                    try { det = await fetchDetail(t.id); panelDetails[t.id] = det; const aIds = collectAssetIds(det); if (aIds.length) await fetchAssetThumbs(aIds); } catch {}
                    sendNotify(t, heads[t.user.id] || null, det);
                    showToast(t, heads[t.user.id] || null, det);
                }
                dirty = true;
            }
            if (dirty) saveSeen(seen);
            first = false;
            if (panelOpen) { panelTrades = trades; renderPanelContent(); }
        } catch {}
    }



    async function init() {
        if (extEnabled(17)) {
            if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
            injectCss();
            injectBadge();
            await seedCsrf();
            await Promise.all([fetchKoromons(), fetchCreditsHeads()]);
            poll();
            pollTimer = setInterval(poll, settings.pollInterval);
            setInterval(fetchKoromons, 300000);

            // Pekora trades page indicators
            if (window.location.pathname.includes('/My/Trades') || window.location.href.includes('/My/Trades')) {
                await fetchKoromons();
                injectPekoraIndicators();
                setInterval(() => { injectPekoraIndicators(); }, 4000);
                new MutationObserver(() => { setTimeout(injectPekoraIndicators, 600); }).observe(document.body, { childList: true, subtree: true });
            }
        }

        // Watch DOM changes (for SPA navigation) — sidebar injection handled independently below
        new MutationObserver(() => {
            if (extEnabled(17)) injectBadge();
        }).observe(document.body, { childList: true, subtree: true });
    }


    // ══════════════════════════════════════════════════════════════
    // TRADE WINDOW THEME & TAGS (Keep Original Layout)
    // ══════════════════════════════════════════════════════════════

    function fmtNum(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return n.toLocaleString();
    }


    let tradeEnhanced = false;
    const selectedItems = { my: [], their: [] };
    const allItems = { my: [], their: [] };
    const inventoryPages = { my: 0, their: 0 };
    const ITEMS_PER_PAGE = 10; // 5 cols x 2 rows


    async function getUsername(userId) {
        try {
            const resp = await fetch(BASE + '/apisite/users/v1/users/' + userId, { credentials: 'include' });
            const data = await resp.json();
            return data.name || data.displayName || 'Roblox Player';
        } catch (err) {
                        return 'Roblox Player';
        }
    }

    async function enhanceTradeWindow() {
        // Check if we should skip custom UI to use Pekora's original
        if (localStorage.getItem('rokorone_disable_custom_ui') === 'true') {
            localStorage.removeItem('rokorone_disable_custom_ui');

            // Check for pending trade data
            const pendingData = localStorage.getItem('rokorone_pending_trade');
            if (pendingData) {
                const trade = JSON.parse(pendingData);
                                localStorage.removeItem('rokorone_pending_trade');
                // Original Pekora UI will be shown, user can send from there
            }
            return; // Don't replace UI, show original Pekora
        }

        if (tradeEnhanced) return;
        tradeEnhanced = true;


        await fetchKoromons();

        // Hide ALL original page content
        document.body.innerHTML = '';
        document.body.style.cssText = 'margin:0;padding:0;background:#222627';

        // Build complete custom UI
        const ui = document.createElement('div');
        ui.id = 'rok-trade-ui';
        ui.style.cssText = 'min-height:100vh;padding:20px;font-family:Inter,sans-serif';

        ui.innerHTML = `
            <div style="max-width:1200px;margin:0 auto">
                <h1 id="trade-title" style="font-size:22px;margin:0 0 20px 0;color:#fff;font-weight:700">Trade with Roblox Player</h1>
                <div style="display:grid;grid-template-columns:1fr 420px;gap:20px">
                    <!-- LEFT: Inventories -->
                    <div>
                        <div style="background:#222627;padding:12px;border-right:1px solid #2a2e2f">
                            <!-- Your Inventory -->
                            <div style="margin-bottom:0">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                                    <h2 style="font-size:18px;margin:0;color:#fff;font-weight:700">Your Inventory</h2>
                                    <select id="my-sort" style="background:#222627;color:#fff;border:3px solid #5a5e5f;border-radius:0;padding:8px 12px;font-size:15px;font-family:inherit;cursor:pointer;width:260px;outline:none">
                                        <option value="default">All Accessories</option>
                                        <option value="value-high">Value: High to Low</option>
                                        <option value="value-low">Value: Low to High</option>
                                        <option value="rap-high">RAP: High to Low</option>
                                        <option value="rap-low">RAP: Low to High</option>
                                        <option value="name-az">Name: A-Z</option>
                                        <option value="name-za">Name: Z-A</option>
                                    </select>
                                </div>
                                <div style="display:flex;justify-content:flex-end;margin-bottom:10px;margin-top:-2px">
                                    <input type="text" id="my-search" placeholder="Search for item" style="width:260px;background:#1a1d1e;color:#fff;border:2px solid #5a5e5f;border-radius:0;padding:8px 12px;font-size:15px;font-family:inherit;outline:none">
                                </div>
                                <div id="my-inv" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;height:auto">
                                    <div style="grid-column:1/-1;text-align:center;padding:60px;color:#999">Loading...</div>
                                </div>
                                <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-top:12px">
                                    <button id="my-prev" style="width:32px;height:32px;background:#3a3e3f;border:1px solid #4a4e4f;border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#ccc">‹</button>
                                    <span style="font-size:13px;color:#999">Page 1</span>
                                    <button id="my-next" style="width:32px;height:32px;background:#3a3e3f;border:1px solid #4a4e4f;border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#ccc">›</button>
                                </div>
                            </div>

                            <!-- Thin gray divider line -->
                            <div style="height:1px;background:#3a3e3f;margin:24px 0"></div>

                            <!-- Their Inventory -->
                            <div>
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                                    <h2 id="their-inv-heading" style="font-size:18px;margin:0;color:#fff;font-weight:700">Roblox Player's Inventory</h2>
                                    <select id="their-sort" style="background:#222627;color:#fff;border:3px solid #5a5e5f;border-radius:0;padding:8px 12px;font-size:15px;font-family:inherit;cursor:pointer;width:260px;outline:none">
                                        <option value="default">All Accessories</option>
                                        <option value="value-high">Value: High to Low</option>
                                        <option value="value-low">Value: Low to High</option>
                                        <option value="rap-high">RAP: High to Low</option>
                                        <option value="rap-low">RAP: Low to High</option>
                                        <option value="name-az">Name: A-Z</option>
                                        <option value="name-za">Name: Z-A</option>
                                    </select>
                                </div>
                                <div style="display:flex;justify-content:flex-end;margin-bottom:10px;margin-top:-2px">
                                    <input type="text" id="their-search" placeholder="Search for item" style="width:260px;background:#1a1d1e;color:#fff;border:2px solid #5a5e5f;border-radius:0;padding:8px 12px;font-size:15px;font-family:inherit;outline:none">
                                </div>
                                <div id="their-inv" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;height:auto">
                                    <div style="grid-column:1/-1;text-align:center;padding:60px;color:#999">Loading...</div>
                                </div>
                                <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-top:12px">
                                    <button id="their-prev" style="width:32px;height:32px;background:#3a3e3f;border:1px solid #4a4e4f;border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#ccc">‹</button>
                                    <span style="font-size:13px;color:#999">Page 1</span>
                                    <button id="their-next" style="width:32px;height:32px;background:#3a3e3f;border:1px solid #4a4e4f;border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#ccc">›</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT: Offers -->
                    <div style="background:#222627;border-radius:8px;padding:16px">
                        <!-- Your Offer -->
                        <div style="margin-bottom:48px;margin-top:-12px">
                            <h2 style="font-size:22px;margin:0 0 24px 0;color:#fff;font-weight:700">Your Offer</h2>
                            <div id="my-offer-slots" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;border-radius:8px">
                                <div style="background:#18191a;border:1px solid #2a2e2f;border-radius:8px;height:64px"></div>
                                <div style="background:#18191a;border:1px solid #2a2e2f;border-radius:8px;height:64px"></div>
                                <div style="background:#18191a;border:1px solid #2a2e2f;border-radius:8px;height:64px"></div>
                                <div style="background:#18191a;border:1px solid #2a2e2f;border-radius:8px;height:64px"></div>
                            </div>
                            <div id="my-offer" style="display:none"></div>
                            <div style="background:#000;border-radius:8px;padding:4px 10px;margin-bottom:8px;display:flex;align-items:center;gap:8px">
                                <span style="color:#fff;font-size:15px;font-weight:700">R$</span>
                                <input type="number" id="my-robux-input" placeholder="Plus Robux Amount" style="flex:1;background:transparent;border:none;color:#fff;font-size:15px;font-family:inherit;outline:none" min="0">
                            </div>
                            <div style="font-size:11px;color:#666;margin-bottom:8px">After 30% fee:</div>
                            <div style="font-size:16px;color:#fff;font-weight:700;margin-bottom:4px;display:flex;justify-content:space-between">
                                <span>Total Value:</span>
                                <span style="color:#fff">R$ <span id="my-total">0</span></span>
                            </div>
                        </div>

                        <!-- Your Request -->
                        <div style="margin-bottom:16px;margin-top:108px">
                            <h2 style="font-size:22px;margin:0 0 24px 0;color:#fff;font-weight:700">Your Request</h2>
                            <div id="their-offer-slots" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
                                <div style="background:#18191a;border:1px solid #2a2e2f;border-radius:8px;height:64px"></div>
                                <div style="background:#18191a;border:1px solid #2a2e2f;border-radius:8px;height:64px"></div>
                                <div style="background:#18191a;border:1px solid #2a2e2f;border-radius:8px;height:64px"></div>
                                <div style="background:#18191a;border:1px solid #2a2e2f;border-radius:8px;height:64px"></div>
                            </div>
                            <div id="their-offer" style="display:none"></div>
                            <div style="background:#000;border-radius:8px;padding:4px 10px;margin-bottom:8px;display:flex;align-items:center;gap:8px">
                                <span style="color:#fff;font-size:15px;font-weight:700">R$</span>
                                <input type="number" id="their-robux-input" placeholder="Plus Robux Amount" style="flex:1;background:transparent;border:none;color:#fff;font-size:15px;font-family:inherit;outline:none" min="0">
                            </div>
                            <div style="font-size:11px;color:#666;margin-bottom:8px">After 30% fee:</div>
                            <div style="font-size:16px;color:#fff;font-weight:700;margin-bottom:4px;display:flex;justify-content:space-between">
                                <span>Total Value:</span>
                                <span style="color:#fff">R$ <span id="their-total">0</span></span>
                            </div>
                        </div>

                        <!-- Send Trade Button -->
                        <button id="send-trade" style="width:100%;background:#fff;color:#000;border:none;border-radius:6px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;pointer-events:auto">
                            Make Offer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(ui);


        // Get and display partner's username
        const params = new URLSearchParams(window.location.search);
        const partnerId = params.get('TradePartnerID');
        if (partnerId) {
            getUsername(partnerId).then(name => {
                const titleEl = document.getElementById('trade-title');
                if (titleEl) {
                    titleEl.textContent = 'Trade with ' + name;
                }
                // Update "Their Inventory" heading
                const theirInvHeading = document.getElementById('their-inv-heading');
                if (theirInvHeading) {
                    theirInvHeading.textContent = name + "'s Inventory";
                }
            });
        }

        // Attach button handler IMMEDIATELY after UI is built
        const attachButton = () => {
            const btn = document.getElementById('send-trade');
                        if (btn) {
                btn.addEventListener('click', async function(e) {
                    e.preventDefault();

                    const myRobuxInput = document.getElementById('my-robux-input');
                    const theirRobuxInput = document.getElementById('their-robux-input');
                    const myRobux = parseInt(myRobuxInput?.value) || 0;
                    const theirRobux = parseInt(theirRobuxInput?.value) || 0;

                    const params = new URLSearchParams(window.location.search);
                    const tradePartnerId = params.get('TradePartnerID');

                    if (!tradePartnerId) {
                        alert('No trade partner found');
                        return;
                    }

                    const myOffers = selectedItems.my.map(item => item.userAssetId);
                    const theirOffers = selectedItems.their.map(item => item.userAssetId);

                    if (myOffers.length === 0 && theirOffers.length === 0 && myRobux === 0 && theirRobux === 0) {
                        alert('Please select items or add Robux');
                        return;
                    }


                    // Send trade using Pekora's API
                    const EP_TRADE_SEND = BASE + '/apisite/trades/v1/trades/send';
                    const myUserId = await getMyUserId();

                    const payload = {
                        offers: [
                            { userId: myUserId, userAssetIds: myOffers, robux: myRobux },
                            { userId: parseInt(tradePartnerId), userAssetIds: theirOffers, robux: theirRobux }
                        ]
                    };

                                        btn.disabled = true;
                    btn.textContent = 'Sending...';

                    try {
                        await apiPost(EP_TRADE_SEND, payload);
                        alert('Trade sent successfully!');
                                                // Clear selections
                        selectedItems.my = [];
                        selectedItems.their = [];
                        updateOffers();
                        renderInventoryPage('my-inv', 'my');
                        renderInventoryPage('their-inv', 'their');
                    } catch (err) {
                        alert('Error sending trade: ' + err.message);
                                            } finally {
                        btn.disabled = false;
                        btn.textContent = 'Make Offer';
                    }
                });
                            } else {
                                setTimeout(attachButton, 500);
            }
        };
        attachButton();

        loadInventories();

        // Initial totals update
        setTimeout(() => {
            updateTotals();
        }, 500);
    }

    function esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }


    function sortInventory(items, sortType) {
        const sorted = [...items];

        switch(sortType) {
            case 'value-high':
                sorted.sort((a, b) => {
                    const aVal = (koromonsItems[a.assetId] || {}).value || 0;
                    const bVal = (koromonsItems[b.assetId] || {}).value || 0;
                    return bVal - aVal;
                });
                break;
            case 'value-low':
                sorted.sort((a, b) => {
                    const aVal = (koromonsItems[a.assetId] || {}).value || 0;
                    const bVal = (koromonsItems[b.assetId] || {}).value || 0;
                    return aVal - bVal;
                });
                break;
            case 'rap-high':
                sorted.sort((a, b) => {
                    const aRap = (koromonsItems[a.assetId] || {}).rap || 0;
                    const bRap = (koromonsItems[b.assetId] || {}).rap || 0;
                    return bRap - aRap;
                });
                break;
            case 'rap-low':
                sorted.sort((a, b) => {
                    const aRap = (koromonsItems[a.assetId] || {}).rap || 0;
                    const bRap = (koromonsItems[b.assetId] || {}).rap || 0;
                    return aRap - bRap;
                });
                break;
            case 'name-az':
                sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'name-za':
                sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            default:
                // Keep default order
                break;
        }

        return sorted;
    }


    const searchFilters = { my: '', their: '' };

    function filterInventory(items, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') return items;
        const term = searchTerm.toLowerCase().trim();
        return items.filter(item => {
            const name = (item.name || '').toLowerCase();
            const serial = (item.serialNumber || '').toString();
            return name.includes(term) || serial.includes(term);
        });
    }

    function renderInventoryPage(containerId, side) {
        const container = document.getElementById(containerId);
        const items = allItems[side];

        // Apply search filter
        const filteredItems = filterInventory(items, searchFilters[side]);

        const page = inventoryPages[side];
        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = filteredItems.slice(start, end);

        container.innerHTML = '';

        pageItems.forEach(item => {
            const kol = koromonsItems[item.assetId] || {};

            // Debug: log first item lookup with Pekora item data
            if (!window._firstLookupDone) {
                                                window._firstLookupDone = true;
            }

            const card = document.createElement('div');
            const isSelected = selectedItems[side].some(i => i.userAssetId === item.userAssetId);

            card.className = 'mt-item-card';
            card.style.cssText = `
                background: #222627;
                border: none;
                border-radius: 8px;
                padding: 1px;
                cursor: pointer;
                transition: all 0.15s;
                text-align: center;
                box-sizing: border-box;
                width: 100%;
                position: relative;
            `;

            // Try to get RAP from Pekora's item data as fallback
            const pekoraRAP = item.recentAveragePrice || item.RAP || item.rap || 0;

            // Use Koromons value if available, otherwise use Pekora RAP
            const rap = kol.rap || pekoraRAP;
            const val = kol.value || pekoraRAP;
            const serial = item.serialNumber || '';

            card.innerHTML = `
                <div style="width:100%;aspect-ratio:1/1;background:#343638;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-bottom:1px;position:relative">
                    ${isSelected ? '<div style="position:absolute;top:5px;right:5px;background:#fff;color:#000;border-radius:3px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;z-index:2">✓</div>' : ''}
                    ${isSelected ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);border-radius:6px;z-index:1"></div>' : ''}
                    ${serial ? '<div style="position:absolute;bottom:5px;left:5px;background:rgba(255,255,255,0.2);color:#fff;border-radius:6px;padding:2px 6px;font-size:11px;font-weight:700;z-index:2">#' + serial + '</div>' : ''}
                    <img src="${BASE}/thumbs/asset.ashx?assetId=${item.assetId}&width=110&height=110&format=png"
                         style="width:90%;height:90%;object-fit:contain"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23222%22 width=%221%22 height=%221%22/></svg>'">
                </div>
                <div style="font-size:12px;color:#fff;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:0;line-height:1;text-align:left;padding-left:1px">${esc(item.name || 'Item')}</div>
                <div style="font-size:11px;color:#fff;font-weight:900;text-align:left;padding-left:1px;margin-top:3px">R$ ${(val || rap || 0).toLocaleString()}</div>
            `;

            card.onclick = () => {
                selectItem(item, side);
            };

            container.appendChild(card);
        });

        updatePaginationButtons(side);
    }

    function renderInventory(containerId, items, side) {
        allItems[side] = items;
        renderInventoryPage(containerId, side);

        // Add sort dropdown listener
        setTimeout(() => {
            const sortSelect = document.getElementById(side + '-sort');
            if (sortSelect && !sortSelect.dataset.listenerAdded) {
                sortSelect.dataset.listenerAdded = 'true';
                sortSelect.addEventListener('change', (e) => {
                    const sortType = e.target.value;
                    const sorted = sortInventory(allItems[side], sortType);
                    allItems[side] = sorted;
                    inventoryPages[side] = 0; // Reset to first page
                    renderInventoryPage(containerId, side);
                });
                            }
        }, 100);

        // Add search input listener
        setTimeout(() => {
            const searchInput = document.getElementById(side + '-search');
            if (searchInput && !searchInput.dataset.listenerAdded) {
                searchInput.dataset.listenerAdded = 'true';
                searchInput.addEventListener('input', (e) => {
                    searchFilters[side] = e.target.value;
                    inventoryPages[side] = 0; // Reset to first page
                    renderInventoryPage(containerId, side);
                });
                            }
        }, 100);
    }

    function updatePaginationButtons(side) {
        const prevBtn = document.getElementById(side + '-prev');
        const nextBtn = document.getElementById(side + '-next');
        const items = allItems[side];
        const filteredItems = filterInventory(items, searchFilters[side]);
        const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
        const currentPage = inventoryPages[side];

        // Update page number text
        const pageText = prevBtn?.parentElement?.querySelector('span');
        if (pageText) {
            pageText.textContent = 'Page ' + (currentPage + 1);
        }

        if (prevBtn) {
            prevBtn.onclick = () => {
                if (inventoryPages[side] > 0) {
                    inventoryPages[side]--;
                    renderInventoryPage(side + '-inv', side);
                }
            };
            prevBtn.disabled = currentPage === 0;
            prevBtn.style.opacity = currentPage === 0 ? '0.3' : '1';
            prevBtn.style.cursor = currentPage === 0 ? 'not-allowed' : 'pointer';
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                if (inventoryPages[side] < totalPages - 1) {
                    inventoryPages[side]++;
                    renderInventoryPage(side + '-inv', side);
                }
            };
            nextBtn.disabled = currentPage >= totalPages - 1;
            nextBtn.style.opacity = currentPage >= totalPages - 1 ? '0.3' : '1';
            nextBtn.style.cursor = currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer';
        }
    }

    function selectItem(item, side) {
        const idx = selectedItems[side].findIndex(i => i.userAssetId === item.userAssetId);
        if (idx > -1) {
            selectedItems[side].splice(idx, 1);
        } else {
            if (selectedItems[side].length >= 4) {
                alert('Maximum 4 items per side');
                return;
            }
            selectedItems[side].push(item);
        }
        updateOffers();
        renderInventoryPage(side + '-inv', side);

        // Gray out inventory items when 4 are selected
        const inventoryContainer = document.getElementById(side + '-inv');
        if (inventoryContainer) {
            const isFull = selectedItems[side].length >= 4;
            const cards = inventoryContainer.querySelectorAll('.mt-item-card');
            cards.forEach(card => {
                const thumbnail = card.querySelector('div[style*="aspect-ratio"]');
                if (!thumbnail) return;

                const isThisSelected = selectedItems[side].some(i =>
                    card.querySelector('img')?.src.includes(i.assetId)
                );

                // Remove any existing overlay
                const existingOverlay = thumbnail.querySelector('.gray-overlay');
                if (existingOverlay) existingOverlay.remove();

                if (isFull && !isThisSelected) {
                    // Add light overlay to unselected items
                    const overlay = document.createElement('div');
                    overlay.className = 'gray-overlay';
                    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.35);border-radius:6px;z-index:1;pointer-events:none';
                    thumbnail.appendChild(overlay);
                    card.style.pointerEvents = 'none';
                } else {
                    card.style.pointerEvents = 'auto';
                }
            });
        }
    }

    function renderOffer(containerId, items) {
        const side = containerId.includes('my') ? 'my' : 'their';
        const slotsId = containerId + '-slots';
        const sectionDiv = document.getElementById(slotsId);

        if (!sectionDiv) {
                        return;
        }

        const slots = sectionDiv.children;

        // Clear all slots and reset to dark gray
        Array.from(slots).forEach(slot => {
            slot.innerHTML = '';
            slot.style.cursor = 'default';
            slot.style.background = '#18191a';
            slot.onclick = null;
        });

        // Fill slots with items and make them gray
        items.forEach((item, index) => {
            if (index >= 4) return; // Max 4 items
            const kol = koromonsItems[item.assetId] || {};

            // Fallback to Pekora RAP if Koromons has no value
            const pekoraRAP = item.recentAveragePrice || item.RAP || item.rap || 0;
            const displayValue = kol.value || pekoraRAP || 0;

            const slot = slots[index];

            slot.style.cursor = 'pointer';
            slot.style.background = '#222627';
            slot.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;height:100%;padding:8px">
                    <img src="${BASE}/thumbs/asset.ashx?assetId=${item.assetId}&width=110&height=110&format=png"
                         style="width:48px;height:48px;object-fit:contain;background:#343638;flex-shrink:0">
                    <div style="flex:1;min-width:0">
                        <div style="font-size:15px;color:#fff;font-weight:600;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(item.name || 'Item')}</div>
                        <div style="font-size:16px;color:#fff;font-weight:700">R$ ${displayValue.toLocaleString()}</div>
                    </div>
                    <div class="remove-x" style="width:24px;height:24px;background:transparent;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;color:#fff;font-size:16px;font-weight:900">×</div>
                </div>
            `;

            const removeBtn = slot.querySelector('.remove-x');
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                selectItem(item, side);
            };
        });
    }

    function updateOffers() {
        renderOffer('my-offer', selectedItems.my);
        renderOffer('their-offer', selectedItems.their);
        updateTotals();
    }

    function updateTotals() {
        const myRap = selectedItems.my.reduce((s, i) => {
            const kol = koromonsItems[i.assetId] || {};
            const pekoraRAP = i.recentAveragePrice || i.RAP || i.rap || 0;
            return s + (kol.rap || pekoraRAP || 0);
        }, 0);
        const myVal = selectedItems.my.reduce((s, i) => {
            const kol = koromonsItems[i.assetId] || {};
            const pekoraRAP = i.recentAveragePrice || i.RAP || i.rap || 0;
            return s + (kol.value || pekoraRAP || 0);
        }, 0);
        const theirRap = selectedItems.their.reduce((s, i) => {
            const kol = koromonsItems[i.assetId] || {};
            const pekoraRAP = i.recentAveragePrice || i.RAP || i.rap || 0;
            return s + (kol.rap || pekoraRAP || 0);
        }, 0);
        const theirVal = selectedItems.their.reduce((s, i) => {
            const kol = koromonsItems[i.assetId] || {};
            const pekoraRAP = i.recentAveragePrice || i.RAP || i.rap || 0;
            return s + (kol.value || pekoraRAP || 0);
        }, 0);

        // Get Robux input values
        const myRobuxInput = document.getElementById('my-robux-input');
        const theirRobuxInput = document.getElementById('their-robux-input');
        const myRobux = myRobuxInput && myRobuxInput.value ? (parseInt(myRobuxInput.value) || 0) : 0;
        const theirRobux = theirRobuxInput && theirRobuxInput.value ? (parseInt(theirRobuxInput.value) || 0) : 0;

        const myItemValue = myVal || myRap;
        const theirItemValue = theirVal || theirRap;
        const myTotal = myItemValue + myRobux;
        const theirTotal = theirItemValue + theirRobux;

        const myTotalEl = document.getElementById('my-total');
        const theirTotalEl = document.getElementById('their-total');

        if (myTotalEl) myTotalEl.textContent = myTotal.toLocaleString();
        if (theirTotalEl) theirTotalEl.textContent = theirTotal.toLocaleString();
    }

    async function loadInventories() {
        const params = new URLSearchParams(window.location.search);
        const partnerId = params.get('TradePartnerID');

        if (!partnerId) {
            return;
        }

        const INV_EP = BASE + '/apisite/inventory/v1/users/{uid}/assets/collectibles';

        // Load my inventory — use apiGet (GM_xmlhttpRequest) so CSRF + credentials work correctly
        try {
            const myUserId = await getMyUserId();
            let myItems = [];
            let cursor = '';
            while (true) {
                const url = INV_EP.replace('{uid}', myUserId) + '?limit=100' + (cursor ? '&cursor=' + cursor : '');
                const data = await apiGet(url, true);
                if (data.data) myItems.push(...data.data);
                if (data.nextPageCursor) cursor = data.nextPageCursor;
                else break;
            }
            renderInventory('my-inv', myItems, 'my');
        } catch (err) {
            console.error('[Korone] Failed to load my inventory:', err);
        }

        // Load their inventory — use apiGet for same reason
        try {
            let theirItems = [];
            let cursor = '';
            while (true) {
                const url = INV_EP.replace('{uid}', partnerId) + '?limit=100' + (cursor ? '&cursor=' + cursor : '');
                const data = await apiGet(url, true);
                if (data.data) theirItems.push(...data.data);
                if (data.nextPageCursor) cursor = data.nextPageCursor;
                else break;
            }
                        renderInventory('their-inv', theirItems, 'their');
        } catch (err) {
                    }

        // Add event listeners to Robux inputs after a brief delay to ensure elements exist
        setTimeout(() => {
            const myRobuxInput = document.getElementById('my-robux-input');
            const theirRobuxInput = document.getElementById('their-robux-input');

            if (myRobuxInput) {
                ['input', 'change', 'keyup', 'blur'].forEach(eventType => {
                    myRobuxInput.addEventListener(eventType, () => {
                        updateTotals();
                    });
                });
                            } else {
                            }

            if (theirRobuxInput) {
                ['input', 'change', 'keyup', 'blur'].forEach(eventType => {
                    theirRobuxInput.addEventListener(eventType, () => {
                        updateTotals();
                    });
                });
                            } else {
                            }
        }, 100);

        // Add search input listener
        setTimeout(() => {
            const searchInput = document.getElementById(side + '-search');
            if (searchInput && !searchInput.dataset.listenerAdded) {
                searchInput.dataset.listenerAdded = 'true';
                searchInput.addEventListener('input', (e) => {
                    searchFilters[side] = e.target.value;
                    inventoryPages[side] = 0; // Reset to first page
                    renderInventoryPage(containerId, side);
                });
                            }
        }, 100);
    }

        if (window.location.pathname.includes('/Trade/TradeWindow')) {

        const runEnhance = () => {
                        enhanceTradeWindow().catch(e => {
                            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(runEnhance, 1000));
        } else {
            setTimeout(runEnhance, 1000);
        }

        // Try again in case elements load late
        setTimeout(runEnhance, 3000);
    } else {
        init();
    }

    })();



    // ============================================================
    // #19 — Import from Roblox (cooper)
    // ============================================================
    (function () {
        if (!extEnabled(19)) return;

        GM_addStyle(`
            #rbx-row          { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:4px 0; }
            #rbx-row input    { flex:1; min-width:160px; }
            #rbx-status       { font-size:12px; margin:3px 0 0; min-height:15px; }
            #rbx-status.ok    { color:#02b757; }
            #rbx-status.err   { color:#c0392b; }
            #rbx-status.wait  { color:#888; }
            #rbx-preview      { display:flex; align-items:center; gap:8px; margin-top:6px; }
            #rbx-preview img  { width:48px; height:48px; object-fit:cover; border:1px solid #ccc; border-radius:3px; flex-shrink:0; }
            #rbx-preview-info { font-size:12px; line-height:1.5; flex:1; }
        `);

        function blobToDataURI(blob) {
            return new Promise((res, rej) => {
                const r = new FileReader();
                r.onload = () => res(r.result);
                r.onerror = rej;
                r.readAsDataURL(blob);
            });
        }

        function extractId(raw) {
            raw = raw.trim();
            let m;
            if ((m = raw.match(/roblox\.com\/(?:catalog|library|asset\/?)\/?(\d+)/i))) return m[1];
            if ((m = raw.match(/rbxassetid:\/\/(\d+)/i))) return m[1];
            if ((m = raw.match(/[?&]id=(\d+)/i))) return m[1];
            if (/^\d+$/.test(raw)) return raw;
            return null;
        }

        function gmGet(url, type) {
            return new Promise((res, rej) => {
                GM_xmlhttpRequest({
                    method: 'GET', url, responseType: type,
                    onload:  r => r.status === 200 ? res(r.response || r.responseText) : rej(new Error('HTTP ' + r.status)),
                    onerror: () => rej(new Error('Network error')),
                });
            });
        }

        function extractTextureId(xml) {
            let m;
            if ((m = xml.match(/roblox\.com\/asset\/?[?]id=(\d+)/i))) return m[1];
            if ((m = xml.match(/rbxassetid:\/\/(\d+)/i)))              return m[1];
            if ((m = xml.match(/asset\/?[?]id=(\d+)/i)))               return m[1];
            return null;
        }

        function buildUI(fileInput) {
            if (document.getElementById('rbx-row')) return;
            const BTN = 'buttons_legacyButton__vUgL2';
            const siteInput = document.querySelector('input[class*="inputItemName"]');
            const INP = siteInput ? siteInput.className : '';
            const wrap = document.createElement('div');
            wrap.id = 'rbx-import-wrap';
            wrap.innerHTML = '<p style="margin-bottom:4px">Or import from Roblox:</p>'
                + '<div id="rbx-row">'
                + '<input id="rbx-id-input" type="text" class="' + INP + '" placeholder="Asset ID, catalog URL, or rbxassetid://" autocomplete="off" spellcheck="false"/>'
                + '<button id="rbx-fetch-btn" type="button" class="' + BTN + '">Fetch</button>'
                + '</div>'
                + '<div id="rbx-status"></div>'
                + '<div id="rbx-preview" style="display:none">'
                + '<img id="rbx-thumb" src="" alt=""/>'
                + '<div id="rbx-preview-info"></div>'
                + '<button id="rbx-apply-btn" type="button" class="' + BTN + '">Apply</button>'
                + '</div>';
            const anchor = fileInput.closest('p') || fileInput.parentElement;
            anchor.parentElement.insertBefore(wrap, anchor.nextSibling);
            const $input   = document.getElementById('rbx-id-input');
            const $fetch   = document.getElementById('rbx-fetch-btn');
            const $status  = document.getElementById('rbx-status');
            const $preview = document.getElementById('rbx-preview');
            const $thumb   = document.getElementById('rbx-thumb');
            const $info    = document.getElementById('rbx-preview-info');
            const $apply   = document.getElementById('rbx-apply-btn');
            let blob = null, name = '';
            function st(text, cls) { $status.textContent = text; $status.className = cls; }
            async function doFetch() {
                const id = extractId($input.value);
                if (!id) { st('Enter a valid asset ID or URL.', 'err'); return; }
                $fetch.disabled = true; $fetch.textContent = '\u2026';
                $preview.style.display = 'none'; blob = null;
                st('Fetching ' + id + '\u2026', 'wait');
                try {
                    const xml = await gmGet('https://assetdelivery.roblox.com/v1/asset/?id=' + id, 'text');
                    let imgId = id;
                    if (/<roblox|ShirtTemplate|PantsTemplate|Graphic/i.test(xml)) {
                        const tid = extractTextureId(xml);
                        if (!tid) { st('Could not find texture in this asset.', 'err'); return; }
                        imgId = tid;
                        st('Found texture ' + imgId + ', downloading\u2026', 'wait');
                    }
                    const dl = await gmGet('https://assetdelivery.roblox.com/v1/asset/?id=' + imgId, 'blob');
                    if (!dl || dl.size === 0) { st('Download failed — asset may be private.', 'err'); return; }
                    blob = dl; name = 'roblox_' + id;
                    $thumb.src = await blobToDataURI(blob);
                    $info.innerHTML = 'ID: ' + imgId + '<br>' + (blob.size / 1024).toFixed(1) + ' KB';
                    $preview.style.display = 'flex';
                    st('Ready — click Apply to load into the form.', 'ok');
                } catch (e) {
                    st('Error: ' + e.message, 'err');
                } finally {
                    $fetch.disabled = false; $fetch.textContent = 'Fetch';
                }
            }
            function doApply() {
                if (!blob) { st('Fetch an asset first.', 'err'); return; }
                try {
                    const ext  = blob.type === 'image/jpeg' ? '.jpg' : '.png';
                    const file = new File([blob], name + ext, { type: blob.type || 'image/png' });
                    const dt   = new DataTransfer();
                    dt.items.add(file);
                    fileInput.files = dt.files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    fileInput.dispatchEvent(new Event('input',  { bubbles: true }));
                    const nameEl = document.querySelector('input[type="text"]:not(#rbx-id-input)');
                    if (nameEl && !nameEl.value) {
                        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(nameEl, name);
                        nameEl.dispatchEvent(new Event('input',  { bubbles: true }));
                        nameEl.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    st('Applied! Fill in the name and click Upload.', 'ok');
                } catch (e) {
                    st('Apply failed: ' + e.message, 'err');
                }
            }
            $fetch.addEventListener('click', doFetch);
            $apply.addEventListener('click', doApply);
            $input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doFetch(); } });
        }

        function tryInject() {
            if (!location.pathname.startsWith('/develop')) return;
            const fi = document.querySelector('input[type="file"]');
            if (fi) buildUI(fi);
        }

        tryInject();

        let debounce = null;
        new MutationObserver(() => {
            if (!location.pathname.startsWith('/develop')) return;
            if (document.getElementById('rbx-row')) return;
            clearTimeout(debounce);
            debounce = setTimeout(tryInject, 80);
        }).observe(document.documentElement, { childList: true, subtree: true });

        const _push    = history.pushState.bind(history);
        const _replace = history.replaceState.bind(history);
        function onNav() { document.getElementById('rbx-import-wrap')?.remove(); setTimeout(tryInject, 100); }
        history.pushState    = (...a) => { _push(...a);    onNav(); };
        history.replaceState = (...a) => { _replace(...a); onNav(); };
        window.addEventListener('popstate', onNav);
    })();

    // ══════════════════════════════════════════════════════════════════════
    // ══ #21 TRADE CALCULATOR ══════════════════════════════════════════════
    // ══════════════════════════════════════════════════════════════════════
    if (extEnabled(21)) (function() {
        'use strict';

        function createUI() {
            if (document.getElementById('pekora-calc-ui')) return;
            const box = document.createElement('div');
            box.id = 'pekora-calc-ui';
            box.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; width: 220px;
                background: #111; color: #fff; padding: 15px;
                border-radius: 12px; z-index: 10000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.7);
                font-family: sans-serif; border: 1px solid #444;
            `;
            box.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 10px; text-align: center; color: #00d2ff; font-size: 12px;">Korone Calculator</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px;">
                    <span>You:</span> <span id="calc-you" style="font-weight: bold; color: #ff5555;">0</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                    <span>Them:</span> <span id="calc-them" style="font-weight: bold; color: #55ff55;">0</span>
                </div>
                <div id="calc-res-box" style="background: #222; border-radius: 6px; padding: 8px; text-align: center;">
                    <span id="calc-diff" style="font-weight: bold; font-size: 14px;">$0</span>
                </div>
            `;
            document.body.appendChild(box);
        }

        function update() {
            // Guard: UI elements only exist on /Trade/ pages
            const elYou  = document.getElementById('calc-you');
            const elThem = document.getElementById('calc-them');
            const elDiff = document.getElementById('calc-diff');
            if (!elYou || !elThem || !elDiff) return;

            const headers = Array.from(document.querySelectorAll('div, span, h1, h2, h3, h4'))
                                 .filter(el => el.innerText === "Your Offer" || el.innerText === "Your Request");

            let yourOfferSection = null;
            let theirOfferSection = null;

            headers.forEach(h => {
                if (h.innerText === "Your Offer") yourOfferSection = h.parentElement;
                if (h.innerText === "Your Request") theirOfferSection = h.parentElement;
            });

            let yourTotal = 0;
            let theirTotal = 0;

            if (yourOfferSection) {
                yourOfferSection.querySelectorAll("[class*='amount-']").forEach(tag => {
                    yourTotal += parseInt(tag.innerText.replace(/[^0-9]/g, '')) || 0;
                });
            }

            if (theirOfferSection) {
                theirOfferSection.querySelectorAll("[class*='amount-']").forEach(tag => {
                    theirTotal += parseInt(tag.innerText.replace(/[^0-9]/g, '')) || 0;
                });
            }

            if (yourTotal === 0 && theirTotal === 0) {
                const allTags = Array.from(document.querySelectorAll("[class*='amount-']"));
                if (allTags.length > 0) {
                    const tradeRow = document.querySelector(".row-0-2-92");
                    const midY = tradeRow ? tradeRow.getBoundingClientRect().top + 150 : window.innerHeight / 2;

                    allTags.forEach(tag => {
                        const rect = tag.getBoundingClientRect();
                        const val = parseInt(tag.innerText.replace(/[^0-9]/g, '')) || 0;
                        if (rect.top < midY) yourTotal += val;
                        else theirTotal += val;
                    });
                }
            }

            elYou.innerText  = yourTotal.toLocaleString();
            elThem.innerText = theirTotal.toLocaleString();

            const diff = theirTotal - yourTotal;

            if (yourTotal === 0 && theirTotal === 0) {
                elDiff.innerText = "Waiting for items...";
                elDiff.style.color = "#888";
            } else {
                const win = diff >= 0;
                elDiff.innerText = (win ? "WIN: +" : "LOSS: ") + Math.abs(diff).toLocaleString();
                elDiff.style.color = win ? "#55ff55" : "#ff5555";
            }
        }

        function tryInit() {
            if (!location.pathname.startsWith('/Trade/')) return;
            createUI();
        }

        tryInit();
        setInterval(update, 600);

        // Handle SPA navigation
        const _push = history.pushState.bind(history);
        const _replace = history.replaceState.bind(history);
        function onNav() {
            setTimeout(() => {
                if (location.pathname.startsWith('/Trade/')) {
                    createUI();
                } else {
                    document.getElementById('pekora-calc-ui')?.remove();
                }
            }, 100);
        }
        history.pushState = (...a) => { _push(...a); onNav(); };
        history.replaceState = (...a) => { _replace(...a); onNav(); };
        window.addEventListener('popstate', onNav);
    })();

    // ══════════════════════════════════════════════════════════════════════
    // ══ #22 2018 USERS SEARCH ═════════════════════════════════════════════
    // ══════════════════════════════════════════════════════════════════════
    if (extEnabled(22)) (function () {
        // Only run on user search pages
        if (!location.pathname.startsWith('/search/users') && !location.href.includes('/search/users')) return;

        function run() {
            document.querySelector('.d-none')?.remove();
            document.querySelectorAll('[class*="row-"]').forEach(item => {
                if (!item.classList.contains('flex')) return;
                // Don't double-inject
                if (item.querySelector('.ng-scope')) return;

                const searchText = document.querySelector('[class*="input"]')?.getAttribute('value')
                    || new URLSearchParams(location.search).get('keyword') || '';

                item.parentElement.style.width = '100%';
                item.style.backgroundColor = '#E3E3E3';
                item.innerHTML = `
<div ng-include="'player-search-page'" class="ng-scope" style="width:100%;">
  <div class="top-row ng-scope">
    <h3 ng-if="!appMeta.isI18nEnabled" class="header ng-scope" style="display:flex;gap:5px;">
      <div style="font-weight:300;width:max-content;">Player Results for</div>
      <span class="keyword ng-binding" style="font-weight:400;">${searchText}</span>
    </h3>
    <div class="search-container" style="margin:6px 0;">
      <div class="input-group" style="position:relative;display:table;clear:both;">
        <input class="form-control input-field ng-pristine ng-untouched ng-valid ng-not-empty"
          value="${searchText}" type="text" placeholder="Search"
          style="font-weight:300;font-size:16px;height:38px;padding:5px 12px;width:101%;border:1px solid #B8B8B8;border-radius:3px;outline:none;box-shadow:none;border-right:0;">
        <div class="input-group-btn" style="position:relative;display:table-cell;width:1%;vertical-align:middle;">
          <button class="input-addon-btn" style="background:#fff;border:1px solid #B8B8B8;border-left:0;border-radius:3px;box-shadow:none;height:38px;outline:none;">
            <span class="icon-search"></span>
          </button>
        </div>
      </div>
    </div>
    <div class="row results-count ng-scope" style="display:flex;">
      <span class="text-secondary hideable ng-binding" style="width:max-content;padding-right:2px;font-size:12px;font-weight:400;color:#757575;">1 - 12 of</span>
      <span class="text-secondary ng-binding" style="width:max-content;padding-left:0;font-size:12px;font-weight:400;color:#757575;">1 <ng-pluralize>Result</ng-pluralize></span>
    </div>
  </div>
  <div class="col-xs-12 section-content-off no-results ng-binding ng-scope ng-hide"
    style="display:none;">There are no matches available for "${searchText}"</div>
  <div class="col-xs-12 section-content-off no-results ng-binding ng-scope"
    style="display:${searchText.length < 3 ? 'block' : 'none'};">Please enter at least 3 characters.</div>
  <div class="col-xs-12 section-content-off unsafe-input ng-scope ng-hide" style="display:none;">
    You have entered unsafe input. Please try your search again.</div>
  <ul class="search-result avatar-cards ng-scope"></ul>
  <div class="results-loading ng-scope" style="display:flex;flex-wrap:wrap;min-height:554.95px;align-content:flex-start;">
    <img class="spinner loading-default load-image" src="https://www.pekora.zip/img/loading.gif"
      style="width:80px;height:24px;vertical-align:middle;display:${searchText.length < 3 ? 'none' : 'block'};margin-top:10%;margin-left:calc(50% - 31px);">
  </div>
  <div class="row ng-scope">
    <div class="rbx-pager">
      <ul class="pager" style="display:flex;justify-content:center;align-items:center;">
        <li class="pager-prev disabled" style="float:none;display:inline-block;vertical-align:top;list-style:none;margin:0;padding:0;">
          <a style="background-color:#FFF;margin-right:5px;"><span class="icon-left"></span></a>
        </li>
        <li class="pager-cur" style="list-style:none;vertical-align:middle;height:max-content;">
          <span id="rbx-current-page" class="ng-binding" style="font-weight:300;vertical-align:middle;">1</span>
        </li>
        <li class="pager-total" style="list-style:none;margin-left:2px;height:max-content;">
          <span style="font-weight:300;vertical-align:middle;">of</span>
          <span class="ng-binding" style="font-weight:300;vertical-align:middle;">1</span>
        </li>
        <li class="pager-next" style="float:none;display:inline-block;vertical-align:top;list-style:none;margin:0 0 0 5px;">
          <a style="background-color:#FFF;"><span class="icon-right"></span></a>
        </li>
      </ul>
    </div>
  </div>
</div>`;

                const input = item.querySelector('.input-field');
                if (input) {
                    input.addEventListener('keydown', e => {
                        if (e.key === 'Enter')
                            location.href = 'https://www.pekora.zip/search/users?keyword=' + encodeURIComponent(input.value);
                    });
                }

                if (searchText.length > 2) {
                    fetch(`https://www.pekora.zip/search/users/results?keyword=${encodeURIComponent(searchText)}&maxRows=12&startIndex=0`)
                        .then(r => r.json())
                        .then(data => {
                            const userId = Number(document.querySelector('[class*="nameLink"]')?.href?.match(/\/users\/(\d+)/)?.[1] || 0);
                            const result = item.querySelector('.results-loading');
                            fetch(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/friends/statuses?userIds=${(data.UserSearchResults || []).slice(0, 9).map(u => u.UserId).join(',')}`)
                                .then(r => r.json()).catch(() => ({}))
                                .then(friends => {
                                    result.innerHTML = '';
                                    (data.UserSearchResults || []).slice(0, 9).forEach(rdata => {
                                        const relationship = friends?.data?.find(f => f.id === rdata.UserId) || {};
                                        result.insertAdjacentHTML('afterbegin', `
<li style="padding-left:0;width:33.3%;padding:0 5px 12px;list-style:none;">
  <div style="border-radius:3px;padding:0;background-color:#fff;position:relative;box-shadow:0 1px 4px 0 rgba(25,25,25,0.3);">
    <div style="min-height:115.99px;">
      <div style="float:left;border:1px solid #B8B8B8;margin:12px;width:92px;position:relative;height:92px;border-radius:50%;background:transparent;">
        <a href="https://www.pekora.zip/users/${rdata.UserId}/profile" style="width:100%;height:100%;display:block;">
          <img src="https://www.pekora.zip/avatar-thumbnail/image?userId=${rdata.UserId}&width=420&height=420&format=png"
            style="width:100%;height:100%;display:block;">
          <div style="float:right;right:0;bottom:0;margin:0;position:absolute;display:${rdata.IsOnline ? 'block' : 'none'};">
            <span class="avatar-status icon-${rdata.LastLocation === 'Website' ? 'online' : 'game'}" title="${rdata.LastLocation}"></span>
          </div>
        </a>
      </div>
      <div style="width:calc(100% - 146px);margin:0;padding:12px 0;float:left;">
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;font-weight:300;">${rdata.Name}</div>
        <div style="color:#B8B8B8;padding:3px 0 0;font-size:14px;font-weight:400;">${rdata.IsOnline ? rdata.LastLocation : 'Offline'}</div>
      </div>
    </div>
    ${relationship?.status ? `<div style="height:57px;padding:9px;background:#F2F2F2;border-top:1px solid #E3E3E3;border-radius:0 0 3px 3px;">
      <button class="btn-control-md friend ${relationship.status === 'NotFriends' ? 'addfriend' : ''}"
        data-userid="${rdata.UserId}"
        style="width:100%;border:1px solid #B8B8B8;background:#fff;color:${(relationship.status === 'RequestSent' || relationship.status === 'Friends' || rdata.UserId === userId) ? '#B8B8B8' : '#191919'};cursor:${(relationship.status === 'RequestSent' || relationship.status === 'Friends' || rdata.UserId === userId) ? 'default' : 'pointer'};display:inline-block;font-weight:400;text-align:center;white-space:nowrap;vertical-align:middle;padding:9px;font-size:18px;line-height:100%;border-radius:3px;">
        ${rdata.UserId === userId ? 'You' : relationship.status === 'NotFriends' ? 'Add Friend' : relationship.status === 'RequestSent' ? 'Request Sent' : relationship.status === 'RequestReceived' ? 'Accept Request' : 'Friends'}
      </button>
    </div>` : ''}
  </div>
</li>`);
                                    });
                                    result.querySelectorAll('.addfriend').forEach(btn => {
                                        btn.addEventListener('click', () => {
                                            const uid = btn.getAttribute('data-userid');
                                            fetch(`https://www.pekora.zip/apisite/friends/v1/users/${uid}/request-friendship`, { method: 'POST' });
                                            btn.textContent = 'Request Sent';
                                            btn.classList.remove('addfriend');
                                            btn.style.color = '#B8B8B8';
                                            btn.style.cursor = 'default';
                                        });
                                    });
                                });
                        })
                        .catch(() => {});
                }
            });
        }

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
        else run();
    })();

    // ══════════════════════════════════════════════════════════════════════
    // ══ #23 TRADE+ ════════════════════════════════════════════════════════
    // ══════════════════════════════════════════════════════════════════════
    if (extEnabled(23)) (function () {
        if (!location.pathname.startsWith('/Trade/')) return;

        const BASE_URL = 'https://www.pekora.zip';
        const AUTH_ENDPOINT = '/apisite/users/v1/users/authenticated';
        const INVENTORY_ENDPOINT = '/apisite/inventory/v1/users/{userId}/assets/collectibles';
        const TRADE_ENDPOINT = '/apisite/trades/v1/trades/send';
        const COUNTER_ENDPOINT = '/apisite/trades/v1/trades/{tradeId}/counter';
        const TRADE_INFO_ENDPOINT = '/apisite/trades/v1/trades/{tradeId}';
        const KOLIMONS_API = 'https://www.koromons.xyz/api/items';
        const LIMIT = 100;
        const PER_PAGE = 10;
        const MAX_SELECT = 4;

        let injecting = false;
        let injected = false;
        let csrfToken = null;
        let kolimonData = null;
        let kolimonLoading = false;
        let kolimonLoaded = false;
        let offerEl = null;
        let darkMode = true;

        function getTradeSessionId() {
            const p = new URLSearchParams(location.search);
            for (const k of ['TradeSessionId', 'tradeSessionId', 'tradesessionid']) {
                const v = p.get(k); if (v && /^\d+$/.test(v)) return v;
            }
            const m = location.href.match(/[?&]TradeSessionId=(\d+)/i);
            return m ? m[1] : null;
        }

        const tradeSessionId = getTradeSessionId();
        const isCounter = !!tradeSessionId;

        try {
            const saved = GM_getValue('tp_dark', true);
            if (saved !== null && saved !== undefined) darkMode = (saved === true || saved === 'true');
        } catch (e) {}

        function saveTheme() {
            try { GM_setValue('tp_dark', darkMode); } catch (e) {}
        }

        const STYLE = document.createElement('style');
        STYLE.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        [data-tp-theme="dark"] .tp-item-img-wrap { background: #1a1a28 !important; }
        [data-tp-theme="light"] .tp-item-img-wrap { background: #e8e9ed !important; }
        [data-tp-theme="dark"] .tp-slot { background: #1a1a28 !important; }
        [data-tp-theme="light"] .tp-slot { background: #e8e9ed !important; }
        [data-tp-theme="dark"] body { background: #0c0c12 !important; }
        [data-tp-theme="light"] body { background: #f4f5f7 !important; }
        [data-tp-theme="dark"] {
            --tp-page-bg:#0c0c12;--tp-bg:#0c0c12;--tp-card:#13131c;--tp-card-raised:#181824;
            --tp-border:#1f1f2e;--tp-border-light:#2a2a3d;--tp-text:#e2e2ec;
            --tp-text-secondary:#a0a0b8;--tp-text-dim:#7a7a94;--tp-text-muted:#4e4e64;
            --tp-accent:#7c6cf0;--tp-accent-dim:rgba(124,108,240,0.14);--tp-accent-glow:rgba(124,108,240,0.25);
            --tp-green:#34d399;--tp-green-bg:rgba(52,211,153,0.1);--tp-red:#f87171;
            --tp-red-bg:rgba(248,113,113,0.1);--tp-orange:#fb923c;--tp-blue:#60a5fa;
            --tp-pink:#f472b6;--tp-yellow:#fbbf24;--tp-slot-empty:0.12;
            --tp-shadow:0 2px 8px rgba(0,0,0,0.4);--tp-shadow-lg:0 8px 32px rgba(0,0,0,0.5);
            --tp-rarity-common:#9ca3af;--tp-rarity-rare:#60a5fa;--tp-rarity-legendary:#fbbf24;
        }
        [data-tp-theme="light"] {
            --tp-page-bg:#f4f5f7;--tp-bg:#edeef2;--tp-card:#ffffff;--tp-card-raised:#ffffff;
            --tp-border:#e2e3e8;--tp-border-light:#d4d5dc;--tp-text:#111827;
            --tp-text-secondary:#4b5563;--tp-text-dim:#6b7280;--tp-text-muted:#9ca3af;
            --tp-accent:#6d5cdb;--tp-accent-dim:rgba(109,92,219,0.1);--tp-accent-glow:rgba(109,92,219,0.18);
            --tp-green:#059669;--tp-green-bg:rgba(5,150,105,0.08);--tp-red:#dc2626;
            --tp-red-bg:rgba(220,38,38,0.06);--tp-orange:#d97706;--tp-blue:#2563eb;
            --tp-pink:#db2777;--tp-yellow:#ca8a04;--tp-slot-empty:0.2;
            --tp-shadow:0 1px 3px rgba(0,0,0,0.08);--tp-shadow-lg:0 4px 16px rgba(0,0,0,0.1);
            --tp-rarity-common:#6b7280;--tp-rarity-rare:#2563eb;--tp-rarity-legendary:#ca8a04;
        }
        [data-tp-theme] .container-0-2-37{background:var(--tp-page-bg)!important;}
        [data-tp-theme] .container-0-2-37 .font-size-18,[data-tp-theme] .container-0-2-37 .font-size-14,[data-tp-theme] .container-0-2-37 .exitText-0-2-32{color:var(--tp-text)!important;}
        [data-tp-theme] .offerRequestCard-0-2-34{background:var(--tp-card)!important;border-color:var(--tp-border)!important;}
        [data-tp-theme] .offerRequestCard-0-2-34 h3,[data-tp-theme] .offerRequestCard-0-2-34 p,[data-tp-theme] .offerRequestCard-0-2-34 span,[data-tp-theme] .offerRequestCard-0-2-34 div{color:var(--tp-text)!important;}
        [data-tp-theme] .itemCard-0-2-107{background:var(--tp-card)!important;border-color:var(--tp-border)!important;}
        [data-tp-theme] .sendButton-0-2-36,[data-tp-theme] .buyButton-0-2-39{background:var(--tp-accent)!important;color:#fff!important;}
        .tp-counter-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(251,146,60,0.15);border:1px solid rgba(251,146,60,0.3);color:var(--tp-orange)!important;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;letter-spacing:0.3px;margin-bottom:10px;font-family:'Inter',sans-serif;}
        .tp-counter-badge::before{content:'↩';font-size:13px;}
        .tp-prefill-status{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:6px;margin-bottom:10px;font-size:11px;font-weight:600;font-family:'Inter',sans-serif;animation:tp-fadeUp 0.3s ease both;}
        .tp-prefill-loading{background:var(--tp-accent-dim);border:1px solid rgba(124,108,240,0.2);color:var(--tp-accent)!important;}
        .tp-prefill-ok{background:var(--tp-green-bg);border:1px solid rgba(52,211,153,0.2);color:var(--tp-green)!important;}
        .tp-prefill-err{background:var(--tp-red-bg);border:1px solid rgba(248,113,113,0.2);color:var(--tp-red)!important;}
        .tp-item-meta .tp-tag.tp-tag-rap{background:rgba(96,165,250,0.12)!important;color:var(--tp-blue)!important;}
        .tp-item-meta .tp-tag.tp-tag-val{background:rgba(244,114,182,0.12)!important;color:var(--tp-pink)!important;}
        .tp-item-meta .tp-tag.tp-tag-serial{background:rgba(251,146,60,0.12)!important;color:var(--tp-orange)!important;}
        .tp-item-meta .tp-tag.tp-demand-amazing{color:var(--tp-red)!important;}
        .tp-item-meta .tp-tag.tp-demand-high{color:var(--tp-orange)!important;}
        .tp-item-meta .tp-tag.tp-demand-decent{color:var(--tp-yellow)!important;}
        .tp-item-meta .tp-tag.tp-demand-normal{color:var(--tp-blue)!important;}
        .tp-item-meta .tp-tag.tp-demand-low,.tp-item-meta .tp-tag.tp-demand-terrible{color:var(--tp-text-muted)!important;}
        .tp-item-meta .tp-tag.tp-rarity-rare{color:var(--tp-rarity-rare)!important;}
        .tp-item-meta .tp-tag.tp-rarity-legendary{color:var(--tp-rarity-legendary)!important;}
        .tp-item.tp-item-rarity-rare{border-color:rgba(96,165,250,0.3)!important;}
        .tp-item.tp-item-rarity-legendary{border-color:rgba(251,191,36,0.3)!important;}
        @keyframes tp-fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tp-scaleIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
        @keyframes tp-slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tp-checkPop{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
        @keyframes tp-spin-anim{to{transform:rotate(360deg)}}
        @keyframes tp-ripple{0%{transform:scale(0);opacity:0.4}100%{transform:scale(4);opacity:0}}
        .tp-section{margin-top:8px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;animation:tp-fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both;}
        .tp-section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 2px;}
        .tp-section-title{font-size:13px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;margin:0;display:flex;align-items:center;gap:6px;}
        .tp-section-title::before{content:'';width:3px;height:13px;background:var(--tp-accent);border-radius:2px;}
        .tp-count{background:var(--tp-accent-dim);padding:2px 8px;border-radius:10px;font-weight:600;font-size:10px;color:var(--tp-accent)!important;}
        .tp-search-row{display:flex;gap:6px;margin-bottom:8px;align-items:center;}
        .tp-search-box{position:relative;flex:1;}
        .tp-search-input{width:100%;height:32px;padding:0 28px 0 30px;border:1px solid var(--tp-border);border-radius:8px;font-size:12px;font-family:inherit;outline:none;box-sizing:border-box;transition:border-color 0.2s,box-shadow 0.2s;background:var(--tp-card)!important;color:var(--tp-text)!important;}
        .tp-search-input:focus{border-color:var(--tp-accent);box-shadow:0 0 0 3px var(--tp-accent-dim);}
        .tp-search-icon{position:absolute;left:9px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none;color:var(--tp-text-muted)!important;}
        .tp-search-clear{position:absolute;right:6px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:14px;border:none;background:none;display:none;padding:0;line-height:1;transition:color 0.15s;font-family:inherit;color:var(--tp-text-muted)!important;}
        .tp-search-clear.visible{display:block;}
        .tp-select{height:32px;font-size:11px;padding:0 22px 0 8px;border:1px solid var(--tp-border);border-radius:8px;outline:none;cursor:pointer;font-family:inherit;transition:border-color 0.2s;min-width:72px;-webkit-appearance:none;appearance:none;background:var(--tp-card)!important;color:var(--tp-text)!important;}
        .tp-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;}
        .tp-item{position:relative;cursor:pointer;border-radius:8px;overflow:hidden;background:var(--tp-card)!important;border:1px solid var(--tp-border);transition:transform 0.15s,box-shadow 0.15s,border-color 0.15s;}
        .tp-item:hover{transform:translateY(-2px);box-shadow:var(--tp-shadow-lg);border-color:var(--tp-border-light);z-index:2;}
        .tp-item.tp-sel{border-color:var(--tp-green)!important;box-shadow:0 0 0 1px var(--tp-green),0 4px 12px var(--tp-green-bg);}
        .tp-item.tp-maxed{opacity:0.25;cursor:not-allowed;pointer-events:none;}
        .tp-item-inner{padding:6px 6px 5px;}
        .tp-item-img-wrap{position:relative;width:100%;aspect-ratio:1;border-radius:6px;overflow:hidden;background:var(--tp-bg)!important;margin-bottom:4px;}
        .tp-item-img-wrap img{width:100%;height:100%;object-fit:contain;display:block;transition:transform 0.2s;}
        .tp-item:hover .tp-item-img-wrap img{transform:scale(1.06);}
        .tp-ck{position:absolute;top:4px;right:4px;background:var(--tp-green)!important;color:#fff!important;border-radius:50%;width:16px;height:16px;font-size:9px;line-height:16px;text-align:center;display:none;pointer-events:none;}
        .tp-item.tp-sel .tp-ck{display:block;animation:tp-checkPop 0.2s cubic-bezier(0.34,1.56,0.64,1);}
        .tp-item-n{font-size:10px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 0 2px;}
        .tp-item-n a{color:var(--tp-text)!important;}
        .tp-item-n a:hover{color:var(--tp-accent)!important;}
        .tp-item-meta{display:flex;flex-wrap:wrap;gap:2px;}
        .tp-tag{display:inline-flex;align-items:center;padding:1px 4px;border-radius:3px;font-size:8px;font-weight:600;line-height:13px;}
        .tp-pag{display:flex;align-items:center;justify-content:center;gap:3px;margin-top:8px;padding:4px 0;}
        .tp-pag-btn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid var(--tp-border);border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.15s;font-family:inherit;background:var(--tp-card)!important;color:var(--tp-text-dim)!important;}
        .tp-pag-btn:hover:not(:disabled){border-color:var(--tp-accent);color:var(--tp-accent)!important;}
        .tp-pag-btn:disabled{opacity:0.2;cursor:not-allowed;}
        .tp-pag-num{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all 0.15s;background:none!important;font-family:inherit;color:var(--tp-text-dim)!important;}
        .tp-pag-num.active{border-color:var(--tp-accent);background:var(--tp-accent)!important;color:#fff!important;}
        .tp-loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:32px 0;font-size:12px;grid-column:1/-1;color:var(--tp-text-muted)!important;}
        .tp-spin{width:14px;height:14px;border:2px solid var(--tp-border);border-top-color:var(--tp-accent);border-radius:50%;animation:tp-spin-anim 0.7s linear infinite;}
        .tp-empty{text-align:center;font-size:12px;padding:32px 8px;grid-column:1/-1;color:var(--tp-text-muted)!important;}
        .tp-err{display:flex;align-items:center;justify-content:center;gap:8px;padding:24px 0;font-size:12px;grid-column:1/-1;color:var(--tp-red)!important;}
        .tp-retry{background:var(--tp-accent)!important;color:#fff!important;border:none;border-radius:6px;padding:4px 12px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:600;}
        .tp-offer-card{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--tp-card)!important;border:1px solid var(--tp-border);border-radius:12px;padding:16px;animation:tp-scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both;box-shadow:var(--tp-shadow);}
        .tp-offer-half{margin-bottom:4px;}
        .tp-offer-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;color:var(--tp-text)!important;}
        .tp-offer-totals{font-size:10px;font-weight:500;letter-spacing:0;text-transform:none;display:flex;gap:8px;}
        .tp-t-rap{color:var(--tp-blue)!important;}
        .tp-t-val{color:var(--tp-pink)!important;}
        .tp-offer-slots{display:flex;gap:6px;}
        .tp-slot{flex:1;aspect-ratio:1;border-radius:8px;border:1.5px dashed var(--tp-border-light);background:var(--tp-bg)!important;overflow:hidden;position:relative;transition:border-color 0.15s;}
        .tp-slot.tp-filled{border-style:solid;border-color:var(--tp-border);border-width:1px;}
        .tp-slot.tp-filled:hover{border-color:var(--tp-red);}
        .tp-slot img{width:100%;height:100%;object-fit:contain;display:block;cursor:pointer;transition:opacity 0.15s;}
        .tp-slot.tp-filled:hover img{opacity:0.6;}
        .tp-slot-remove{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.15s;pointer-events:none;font-size:18px;font-weight:700;color:var(--tp-red)!important;}
        .tp-slot.tp-filled:hover .tp-slot-remove{opacity:1;}
        .tp-slot-serial{position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.65)!important;font-size:7px;font-weight:700;padding:1px 4px;border-radius:3px;pointer-events:none;color:var(--tp-orange)!important;}
        .tp-robux-row{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:11px;color:var(--tp-text-dim)!important;}
        .tp-robux-inp{width:100px;height:26px;padding:0 8px;border:1px solid var(--tp-border);border-radius:6px;font-size:11px;font-family:inherit;background:var(--tp-bg)!important;color:var(--tp-text)!important;outline:none;box-sizing:border-box;transition:border-color 0.2s;}
        .tp-robux-inp:focus{border-color:var(--tp-accent);box-shadow:0 0 0 2px var(--tp-accent-dim);}
        .tp-offer-div{border:none;border-top:1px solid var(--tp-border);margin:14px 0;}
        .tp-analytics{background:var(--tp-bg)!important;border:1px solid var(--tp-border);border-radius:8px;padding:10px 12px;margin-top:12px;animation:tp-slideDown 0.25s ease both;}
        .tp-analytics-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;color:var(--tp-text-dim)!important;}
        .tp-an-row{display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:11px;}
        .tp-an-label{color:var(--tp-text-muted)!important;}
        .tp-an-pos{color:var(--tp-green)!important;}
        .tp-an-neg{color:var(--tp-red)!important;}
        .tp-an-neu{color:var(--tp-text-dim)!important;}
        .tp-an-value{font-weight:600;}
        .tp-an-divider{border:none;border-top:1px solid var(--tp-border);margin:5px 0;}
        .tp-verdict{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-radius:6px;margin-top:4px;}
        .tp-verdict-win{background:var(--tp-green-bg)!important;}
        .tp-verdict-loss{background:var(--tp-red-bg)!important;}
        .tp-verdict-even{background:var(--tp-accent-dim)!important;}
        .tp-verdict-label{font-size:12px;font-weight:700;}
        .tp-verdict-pct{font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;}
        .tp-verdict-pct-win{background:var(--tp-green-bg)!important;color:var(--tp-green)!important;}
        .tp-verdict-pct-loss{background:var(--tp-red-bg)!important;color:var(--tp-red)!important;}
        .tp-verdict-pct-even{background:var(--tp-accent-dim)!important;color:var(--tp-text-dim)!important;}
        .tp-send-btn{width:100%;padding:10px 0;margin-top:12px;background:var(--tp-accent)!important;color:#fff!important;border:none;border-radius:8px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
        .tp-send-btn:hover:not(:disabled){filter:brightness(1.1);box-shadow:0 4px 16px var(--tp-accent-glow);transform:translateY(-1px);}
        .tp-send-btn:disabled{opacity:0.4;cursor:not-allowed;}
        .tp-counter-btn{width:100%;padding:10px 0;margin-top:6px;background:transparent!important;color:var(--tp-orange)!important;border:1px solid rgba(251,146,60,0.4);border-radius:8px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
        .tp-counter-btn:hover:not(:disabled){background:rgba(251,146,60,0.1)!important;border-color:var(--tp-orange);}
        .tp-counter-btn:disabled{opacity:0.4;cursor:not-allowed;}
        .tp-btn-ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,0.25)!important;width:10px;height:10px;animation:tp-ripple 0.5s ease-out forwards;pointer-events:none;}
        .tp-send-st{text-align:center;font-size:11px;margin-top:6px;min-height:16px;font-weight:500;}
        .tp-send-ok{color:var(--tp-green)!important;}
        .tp-send-er{color:var(--tp-red)!important;}
        .tp-fee{font-size:10px;margin-top:6px;text-align:center;color:var(--tp-text-muted)!important;}
        .tp-hidden{display:none!important;}
        `;
        document.head.appendChild(STYLE);

        const ASSET_TYPES = [
            {value:'null',label:'All'},{value:'8',label:'Hats'},{value:'41',label:'Hair'},
            {value:'42',label:'Face Acc.'},{value:'43',label:'Neck'},{value:'44',label:'Shoulders'},
            {value:'45',label:'Front'},{value:'46',label:'Back'},{value:'47',label:'Waist'},
            {value:'19',label:'Gear'},{value:'18',label:'Faces'},
        ];
        const SORT_OPTIONS = [
            {value:'default',label:'Default'},{value:'rap-desc',label:'RAP ↓'},{value:'rap-asc',label:'RAP ↑'},
            {value:'val-desc',label:'Value ↓'},{value:'val-asc',label:'Value ↑'},
            {value:'name-asc',label:'A → Z'},{value:'name-desc',label:'Z → A'},
            {value:'demand-desc',label:'Demand ↓'},
        ];
        const DEMAND_ORDER = {amazing:5,high:4,decent:3,normal:2,low:1,terrible:0,unvalued:-1};
        const tpCache = {};
        let authUser = null;

        function applyTheme() {
            document.documentElement.setAttribute('data-tp-theme', darkMode ? 'dark' : 'light');
            document.body.setAttribute('data-tp-theme', darkMode ? 'dark' : 'light');
            const c = document.querySelector('.container-0-2-37');
            if (c) c.setAttribute('data-tp-theme', darkMode ? 'dark' : 'light');
            const toggle = document.getElementById('tp-theme-toggle');
            if (toggle) toggle.querySelector('.tp-theme-icon').textContent = darkMode ? '☀' : '☽';
        }

        function createToggle() {
            if (document.getElementById('tp-theme-toggle')) return;
            const btn = document.createElement('button');
            btn.id = 'tp-theme-toggle';
            btn.title = 'Toggle theme (Trade+)';
            btn.style.cssText = 'position:fixed;top:12px;right:52px;z-index:99999;width:36px;height:36px;border-radius:8px;border:1px solid var(--tp-border);background:var(--tp-card);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;transition:all 0.25s;box-shadow:var(--tp-shadow);padding:0;color:var(--tp-text);font-family:inherit;';
            const icon = document.createElement('span'); icon.className = 'tp-theme-icon'; icon.textContent = darkMode ? '☀' : '☽';
            btn.appendChild(icon);
            btn.addEventListener('click', () => { darkMode = !darkMode; saveTheme(); applyTheme(); });
            document.body.appendChild(btn);
        }

        function fetchKolimons() {
            return new Promise(resolve => {
                if (kolimonLoaded) { resolve(kolimonData); return; }
                if (kolimonLoading) { const iv = setInterval(() => { if (kolimonLoaded) { clearInterval(iv); resolve(kolimonData); } }, 150); return; }
                kolimonLoading = true;
                const done = d => { kolimonData = d || {}; kolimonLoaded = true; resolve(kolimonData); };
                GM_xmlhttpRequest({
                    method:'GET', url:KOLIMONS_API, responseType:'json',
                    headers:{'Accept':'application/json'},
                    onload: r => { try { done(parseKolimons(typeof r.response==='string'?JSON.parse(r.response):r.response)); } catch { done({}); } },
                    onerror: () => done({}), ontimeout: () => done({})
                });
            });
        }

        function parseKolimons(raw) {
            const map = {}, arr = Array.isArray(raw) ? raw : (raw?.items || raw?.data || []);
            if (Array.isArray(arr)) arr.forEach(item => {
                const id = String(item.itemId || item.assetId || item.id);
                if (id && id !== 'undefined') map[id] = {
                    value: item.Value ?? 0, rap: item.RAP ?? 0,
                    demand: (item.Demand || 'unvalued').toLowerCase(),
                    rarity: item.IsRare ? 'rare' : 'common', acronym: item.Acronym || null
                };
            });
            return map;
        }

        function getKolimon(id) { return kolimonData?.[String(id)] || null; }

        function fetchJSON(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method:'GET', url, responseType:'json', headers:{'Accept':'application/json'},
                    onload: r => { if (r.status>=200&&r.status<300) resolve(typeof r.response==='string'?JSON.parse(r.response):r.response); else reject(new Error('HTTP '+r.status)); },
                    onerror: () => reject(new Error('Network error')), ontimeout: () => reject(new Error('Timeout'))
                });
            });
        }

        function postJSON(url, body, token) {
            return new Promise((resolve, reject) => {
                const headers = {'Accept':'application/json','Content-Type':'application/json'};
                if (token) headers['x-csrf-token'] = token;
                GM_xmlhttpRequest({
                    method:'POST', url, responseType:'json', headers, data: JSON.stringify(body),
                    onload: r => { resolve({status:r.status, data:typeof r.response==='string'?JSON.parse(r.response):r.response, headers:r.responseHeaders}); },
                    onerror: () => reject(new Error('Network error')), ontimeout: () => reject(new Error('Timeout'))
                });
            });
        }

        function extractCsrf(h) {
            if (typeof h==='string') { const m=h.match(/x-csrf-token:\s*(.+)/i); return m?m[1].trim():null; }
            return h?.['x-csrf-token']||null;
        }

        async function sendTrade(body) {
            let r = await postJSON(BASE_URL+TRADE_ENDPOINT, body, csrfToken);
            if (r.status===403) { const t=extractCsrf(r.headers); if(t){csrfToken=t; r=await postJSON(BASE_URL+TRADE_ENDPOINT,body,csrfToken);} }
            if (r.status>=200&&r.status<300) return r.data;
            throw new Error(r.data?.errors?.[0]?.message||r.data?.message||'HTTP '+r.status);
        }

        async function counterTrade(tradeId, body) {
            const url = BASE_URL+COUNTER_ENDPOINT.replace('{tradeId}', tradeId);
            let r = await postJSON(url, body, csrfToken);
            if (r.status===403) { const t=extractCsrf(r.headers); if(t){csrfToken=t; r=await postJSON(url,body,csrfToken);} }
            if (r.status>=200&&r.status<300) return r.data;
            throw new Error(r.data?.errors?.[0]?.message||r.data?.message||'HTTP '+r.status);
        }

        async function fetchTradeInfo(tradeId) { return fetchJSON(BASE_URL+TRADE_INFO_ENDPOINT.replace('{tradeId}', tradeId)); }

        function mapTradeItem(ua) {
            return { userAssetId:ua.id, assetId:ua.assetId, name:ua.name, recentAveragePrice:ua.recentAveragePrice??null, serialNumber:ua.serialNumber??null,
                thumbnailUrl:BASE_URL+'/thumbs/asset.ashx?assetId='+ua.assetId+'&width=110&height=110&format=png' };
        }

        async function getAuth() {
            if (authUser) return authUser;
            try { const d=await fetchJSON(BASE_URL+AUTH_ENDPOINT); if(d?.id){authUser={id:String(d.id),name:d.name||'?'};return authUser;} } catch {}
            const l=document.querySelector('a[href*="/users/"][href*="/profile"]');
            if(l){const m=l.href.match(/\/users\/(\d+)/);if(m){authUser={id:m[1],name:'?'};return authUser;}}
            throw new Error('Auth failed');
        }

        function getPartnerId() {
            const p=new URLSearchParams(location.search);
            for (const k of ['TradePartnerID','tradepartnerid','userId','userid','id']) { const v=p.get(k); if(v&&/^\d+$/.test(v))return v; }
            const m=location.href.match(/[?&](?:TradePartnerID|tradepartnerid|userId|userid|id)=(\d+)/i);
            if(m)return m[1];
            if(authUser){for(const l of document.querySelectorAll('a[href*="/users/"][href*="/profile"]')){const lm=l.href.match(/\/users\/(\d+)/);if(lm&&lm[1]!==authUser.id)return lm[1];}}
            return null;
        }

        async function fetchAll(uid, type, prog) {
            const ck=uid+'_'+type;
            if(tpCache[ck]?.ok)return tpCache[ck].items;
            const all=[];let cur='';
            while(true){
                const q=new URLSearchParams({limit:String(LIMIT),assetType:type});if(cur)q.set('cursor',cur);
                const d=await fetchJSON(BASE_URL+INVENTORY_ENDPOINT.replace('{userId}',uid)+'?'+q);
                all.push(...(d.data||[]));if(prog)prog(all.length);
                const nc=d.nextPageCursor||null;if(!nc)break;cur=nc;
            }
            tpCache[ck]={items:all,ok:true};return all;
        }

        const gn=i=>i.name||'Unknown';
        const gid=i=>i.assetId||0;
        const guaid=i=>i.userAssetId||0;
        const grap=i=>i.recentAveragePrice??null;
        const gserial=i=>i.serialNumber??null;
        const gth=i=>i.thumbnailUrl||(gid(i)?BASE_URL+'/thumbs/asset.ashx?assetId='+gid(i)+'&width=110&height=110&format=png':'/img/empty.png');
        const getVal=i=>{const k=getKolimon(gid(i));return k?.value??0;};
        const getRap=i=>{const k=getKolimon(gid(i));if(k?.rap>0)return k.rap;return grap(i)||0;};
        const getDemand=i=>getKolimon(gid(i))?.demand||'unvalued';
        const getRarity=i=>getKolimon(gid(i))?.rarity||'common';

        function sortItems(items, key) {
            const a=[...items];
            if(key==='rap-desc')return a.sort((x,y)=>getRap(y)-getRap(x));
            if(key==='rap-asc')return a.sort((x,y)=>getRap(x)-getRap(y));
            if(key==='val-desc')return a.sort((x,y)=>getVal(y)-getVal(x));
            if(key==='val-asc')return a.sort((x,y)=>getVal(x)-getVal(y));
            if(key==='name-asc')return a.sort((x,y)=>gn(x).localeCompare(gn(y)));
            if(key==='name-desc')return a.sort((x,y)=>gn(y).localeCompare(gn(x)));
            if(key==='demand-desc')return a.sort((x,y)=>(DEMAND_ORDER[getDemand(y)]||0)-(DEMAND_ORDER[getDemand(x)]||0));
            return a;
        }

        function fmtNum(n) {
            if(n>=1000000)return(n/1000000).toFixed(1).replace(/\.0$/,'')+'M';
            if(n>=1000)return(n/1000).toFixed(1).replace(/\.0$/,'')+'K';
            return n.toLocaleString();
        }

        function getPagRange(cur, total) {
            if(total<=7)return Array.from({length:total},(_,i)=>i+1);
            const pages=[1];
            if(cur>3)pages.push('...');
            for(let i=Math.max(2,cur-1);i<=Math.min(total-1,cur+1);i++)pages.push(i);
            if(cur<total-2)pages.push('...');
            if(total>1)pages.push(total);
            return pages;
        }

        function buildSection(label, userId, selected, onSelChange) {
            const sec=document.createElement('div');sec.className='tp-section';
            const hdr=document.createElement('div');hdr.className='tp-section-header';
            const ttl=document.createElement('h3');ttl.className='tp-section-title';ttl.textContent=label;
            const sts=document.createElement('div');sts.className='tp-section-stats tp-count';
            hdr.append(ttl,sts);sec.appendChild(hdr);

            const sr=document.createElement('div');sr.className='tp-search-row';
            const sb=document.createElement('div');sb.className='tp-search-box';
            const si=document.createElement('span');si.className='tp-search-icon';si.textContent='⌕';
            const inp=document.createElement('input');inp.type='text';inp.className='tp-search-input';inp.placeholder='Search items...';
            const xb=document.createElement('button');xb.className='tp-search-clear';xb.textContent='×';
            sb.append(si,inp,xb);
            const cat=document.createElement('select');cat.className='tp-select';
            ASSET_TYPES.forEach(a=>{const o=document.createElement('option');o.value=a.value;o.textContent=a.label;cat.appendChild(o);});
            const srt=document.createElement('select');srt.className='tp-select';
            SORT_OPTIONS.forEach(a=>{const o=document.createElement('option');o.value=a.value;o.textContent=a.label;srt.appendChild(o);});
            sr.append(sb,cat,srt);sec.appendChild(sr);

            const grid=document.createElement('div');grid.className='tp-grid';sec.appendChild(grid);
            const pag=document.createElement('div');pag.className='tp-pag';sec.appendChild(pag);

            let all=[],page=1,curType='null',curSort='default',loading=false,err=null;

            const filt=()=>{const q=inp.value.trim().toLowerCase();return sortItems(q?all.filter(i=>gn(i).toLowerCase().includes(q)):[...all],curSort);};
            const totalPages=()=>Math.max(1,Math.ceil(filt().length/PER_PAGE));
            const pgItems=()=>{const f=filt();return f.slice((page-1)*PER_PAGE,page*PER_PAGE);};
            const isSel=item=>selected.some(s=>guaid(s)===guaid(item));

            function toggle(item) {
                const idx=selected.findIndex(s=>guaid(s)===guaid(item));
                if(idx>=0)selected.splice(idx,1);
                else{if(selected.length>=MAX_SELECT)return;selected.push(item);}
                onSelChange();
            }

            async function load(type, force) {
                if(!userId){showErr('No user ID');return;}
                const ck=userId+'_'+type;
                if(!force&&tpCache[ck]?.ok){all=tpCache[ck].items;err=null;page=1;render();return;}
                loading=true;err=null;grid.innerHTML='';
                const ld=document.createElement('div');ld.className='tp-loading';
                ld.innerHTML='<div class="tp-spin"></div><span>Loading inventory...</span>';
                grid.appendChild(ld);renderPag();updateStats();
                try {
                    const[items]=await Promise.all([
                        fetchAll(userId,type,c=>{const s=ld.querySelector('span');if(s)s.textContent='Loading '+c+' items...';}),
                        fetchKolimons()
                    ]);
                    all=items;err=null;
                } catch(e){err=e.message;const p=tpCache[userId+'_'+type];if(p)all=p.items;}
                loading=false;page=1;render();
            }

            function showErr(msg) {
                grid.innerHTML='';
                const el=document.createElement('div');el.className='tp-err';el.textContent=msg+' ';
                const rb=document.createElement('button');rb.className='tp-retry';rb.textContent='Retry';
                rb.onclick=()=>load(curType,true);
                el.appendChild(rb);grid.appendChild(el);renderPag();updateStats();
            }

            function updateStats() {
                const q=inp.value.trim(),f=filt();
                if(loading)sts.innerHTML='<div class="tp-spin" style="width:10px;height:10px;border-width:1.5px"></div>';
                else if(err)sts.innerHTML='<span style="color:var(--tp-red)">Error</span>';
                else sts.textContent=q?f.length+'/'+all.length:String(all.length);
            }

            function renderPag() {
                pag.innerHTML='';
                const tp=totalPages();if(page>tp)page=tp;if(tp<=1)return;
                const pb=document.createElement('button');pb.className='tp-pag-btn';pb.textContent='‹';pb.disabled=page<=1;
                pb.onclick=()=>{if(page>1){page--;render();}};pag.appendChild(pb);
                getPagRange(page,tp).forEach(p=>{
                    if(p==='...'){const d=document.createElement('span');d.style.padding='0 2px';d.style.color='var(--tp-text-muted)';d.textContent='···';pag.appendChild(d);}
                    else{const b=document.createElement('button');b.className='tp-pag-num';if(p===page)b.classList.add('active');b.textContent=p;b.onclick=()=>{page=p;render();};pag.appendChild(b);}
                });
                const nb=document.createElement('button');nb.className='tp-pag-btn';nb.textContent='›';nb.disabled=page>=tp;
                nb.onclick=()=>{if(page<tp){page++;render();}};pag.appendChild(nb);
            }

            function render() {
                grid.innerHTML='';
                const items=pgItems();
                if(!items.length&&!loading){
                    if(err){showErr(err);return;}
                    const d=document.createElement('div');d.className='tp-empty';
                    const q=inp.value.trim();
                    d.textContent=!all.length&&!q?'No collectibles found':q?'No matches for "'+q+'"':'Empty';
                    grid.appendChild(d);renderPag();updateStats();return;
                }
                items.forEach((item,idx)=>{
                    const rarity=getRarity(item);
                    const w=document.createElement('div');w.className='tp-item';
                    if(rarity)w.classList.add('tp-item-rarity-'+rarity);
                    w.style.animation='tp-fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both';
                    w.style.animationDelay=(idx*25)+'ms';
                    if(isSel(item))w.classList.add('tp-sel');
                    if(selected.length>=MAX_SELECT&&!isSel(item))w.classList.add('tp-maxed');

                    const inner=document.createElement('div');inner.className='tp-item-inner';
                    const imgWrap=document.createElement('div');imgWrap.className='tp-item-img-wrap';
                    const img=document.createElement('img');img.src=gth(item);img.alt=gn(item);img.loading='lazy';
                    img.onerror=function(){this.src='/img/empty.png';};
                    const ck=document.createElement('span');ck.className='tp-ck';ck.textContent='✓';
                    imgWrap.append(img,ck);

                    const nd=document.createElement('p');nd.className='tp-item-n';
                    const a=document.createElement('a');a.target='_blank';a.href='/catalog/'+gid(item)+'/item';
                    a.textContent=gn(item);a.onclick=e=>e.stopPropagation();nd.appendChild(a);

                    const meta=document.createElement('div');meta.className='tp-item-meta';
                    const rap=getRap(item),val=getVal(item),demand=getDemand(item),serial=gserial(item);
                    if(val>0){const t=document.createElement('span');t.className='tp-tag tp-tag-val';t.textContent='Value: '+fmtNum(val);meta.appendChild(t);}
                    if(rap>0){const t=document.createElement('span');t.className='tp-tag tp-tag-rap';t.textContent='RAP: '+fmtNum(rap);meta.appendChild(t);}
                    if(demand&&demand!=='unvalued'&&demand!=='none'){const t=document.createElement('span');t.className='tp-tag tp-demand-'+demand;t.textContent=demand.charAt(0).toUpperCase()+demand.slice(1);meta.appendChild(t);}
                    if(serial!==null){const t=document.createElement('span');t.className='tp-tag tp-tag-serial';t.textContent='#'+serial;meta.appendChild(t);}

                    inner.append(imgWrap,nd,meta);w.appendChild(inner);
                    w.addEventListener('click',()=>{if(w.classList.contains('tp-maxed'))return;toggle(item);render();});
                    grid.appendChild(w);
                });
                renderPag();updateStats();
            }

            let dt;
            inp.addEventListener('input',()=>{clearTimeout(dt);dt=setTimeout(()=>{xb.classList.toggle('visible',inp.value.trim().length>0);page=1;render();},80);});
            xb.addEventListener('click',()=>{inp.value='';xb.classList.remove('visible');page=1;render();inp.focus();});
            cat.addEventListener('change',()=>{curType=cat.value;load(curType);});
            srt.addEventListener('change',()=>{curSort=srt.value;page=1;render();});

            sec._render=render;
            load(curType);
            return sec;
        }

        function buildAnalytics(mySel, partSel) {
            const div=document.createElement('div');div.className='tp-analytics';
            const title=document.createElement('div');title.className='tp-analytics-title';title.textContent='Trade Analysis';
            div.appendChild(title);

            const myRap=mySel.reduce((s,i)=>s+getRap(i),0),pRap=partSel.reduce((s,i)=>s+getRap(i),0);
            const myVal=mySel.reduce((s,i)=>s+getVal(i),0),pVal=partSel.reduce((s,i)=>s+getVal(i),0);
            const rDiff=pRap-myRap,vDiff=pVal-myVal;

            function row(label, mine, theirs, diff) {
                const r=document.createElement('div');r.className='tp-an-row';
                const l=document.createElement('span');l.className='tp-an-label';l.textContent=label;
                const v=document.createElement('span');v.className='tp-an-value '+(diff>0?'tp-an-pos':diff<0?'tp-an-neg':'tp-an-neu');
                v.textContent=fmtNum(mine)+' → '+fmtNum(theirs)+'  '+(diff>0?'+':'')+fmtNum(diff);
                r.append(l,v);return r;
            }
            div.append(row('RAP',myRap,pRap,rDiff),row('Value',myVal,pVal,vDiff));

            const dn={'-1':'—','0':'Terrible','1':'Low','2':'Normal','3':'Decent','4':'High','5':'Amazing'};
            if(mySel.length||partSel.length){
                const am=mySel.length?mySel.reduce((s,i)=>s+(DEMAND_ORDER[getDemand(i)]||0),0)/mySel.length:0;
                const ap=partSel.length?partSel.reduce((s,i)=>s+(DEMAND_ORDER[getDemand(i)]||0),0)/partSel.length:0;
                const dr=document.createElement('div');dr.className='tp-an-row';
                const dl=document.createElement('span');dl.className='tp-an-label';dl.textContent='Demand';
                const dv=document.createElement('span');dv.className='tp-an-value '+(ap>am?'tp-an-pos':ap<am?'tp-an-neg':'tp-an-neu');
                dv.textContent=(dn[String(Math.round(am))]||'—')+' → '+(dn[String(Math.round(ap))]||'—');
                dr.append(dl,dv);div.appendChild(dr);
            }

            const hr=document.createElement('hr');hr.className='tp-an-divider';div.appendChild(hr);
            const verdict=document.createElement('div');
            if(!mySel.length&&!partSel.length){
                verdict.className='tp-verdict tp-verdict-even';
                verdict.innerHTML='<span class="tp-verdict-label tp-an-neu">Select items</span>';
            } else if(vDiff>0){
                const p=myVal>0?((vDiff/myVal)*100).toFixed(1):'∞';
                verdict.className='tp-verdict tp-verdict-win';
                verdict.innerHTML='<span class="tp-verdict-label tp-an-pos">Win</span><span class="tp-verdict-pct tp-verdict-pct-win">+'+p+'%</span>';
            } else if(vDiff<0){
                const p=myVal>0?((Math.abs(vDiff)/myVal)*100).toFixed(1):'∞';
                verdict.className='tp-verdict tp-verdict-loss';
                verdict.innerHTML='<span class="tp-verdict-label tp-an-neg">Loss</span><span class="tp-verdict-pct tp-verdict-pct-loss">-'+p+'%</span>';
            } else {
                verdict.className='tp-verdict tp-verdict-even';
                verdict.innerHTML='<span class="tp-verdict-label tp-an-neu">Even</span><span class="tp-verdict-pct tp-verdict-pct-even">0%</span>';
            }
            div.appendChild(verdict);
            return div;
        }

        function buildOfferCard(mySel, partSel, myId, partId, onChange) {
            const card=document.createElement('div');card.className='tp-offer-card';

            if(isCounter&&tradeSessionId){
                const badge=document.createElement('div');badge.className='tp-counter-badge';
                badge.textContent='Countering Trade #'+tradeSessionId;
                card.appendChild(badge);
            }

            function half(title, items, robuxId) {
                const div=document.createElement('div');div.className='tp-offer-half';
                const lbl=document.createElement('div');lbl.className='tp-offer-label';
                const lt=document.createElement('span');lt.textContent=title;
                const tots=document.createElement('div');tots.className='tp-offer-totals';
                tots.innerHTML='<span class="tp-t-rap">RAP: '+fmtNum(items.reduce((s,i)=>s+getRap(i),0))+'</span><span class="tp-t-val">Value: '+fmtNum(items.reduce((s,i)=>s+getVal(i),0))+'</span>';
                lbl.append(lt,tots);div.appendChild(lbl);

                const slots=document.createElement('div');slots.className='tp-offer-slots';
                for(let i=0;i<MAX_SELECT;i++){
                    const s=document.createElement('div');s.className='tp-slot';
                    if(items[i]){
                        s.classList.add('tp-filled');
                        const img=document.createElement('img');img.src=gth(items[i]);img.alt=gn(items[i]);
                        const rm=document.createElement('div');rm.className='tp-slot-remove';rm.textContent='×';
                        const ci=i;
                        s.addEventListener('click',()=>{const idx=items.indexOf(items[ci]);if(idx>=0)items.splice(idx,1);onChange();});
                        s.append(img,rm);
                        const serial=gserial(items[i]);
                        if(serial!==null){const sb=document.createElement('span');sb.className='tp-slot-serial';sb.textContent='#'+serial;s.appendChild(sb);}
                    } else {
                        const img=document.createElement('img');img.src='/img/empty.png';img.alt='Empty';
                        img.style.opacity='var(--tp-slot-empty)';img.style.cursor='default';
                        s.appendChild(img);
                    }
                    slots.appendChild(s);
                }
                div.appendChild(slots);

                const rr=document.createElement('div');rr.className='tp-robux-row';
                const plus=document.createElement('span');plus.textContent='+';
                const ri=document.createElement('input');ri.type='text';ri.className='tp-robux-inp';ri.placeholder='0';ri.id=robuxId;
                const cur=document.createElement('span');cur.textContent='R$';
                rr.append(plus,ri,cur);div.appendChild(rr);
                return div;
            }

            card.appendChild(half('Your Offer',mySel,'tp-my-robux'));
            const dv=document.createElement('hr');dv.className='tp-offer-div';card.appendChild(dv);
            card.appendChild(half('Their Offer',partSel,'tp-part-robux'));
            card.appendChild(buildAnalytics(mySel,partSel));

            const fee=document.createElement('p');fee.className='tp-fee';fee.textContent='30% fee applies to Robux offers';
            card.appendChild(fee);

            function addRipple(btn) {
                btn.addEventListener('mousedown',function(e){
                    const rect=this.getBoundingClientRect();
                    const rp=document.createElement('span');rp.className='tp-btn-ripple';
                    rp.style.left=(e.clientX-rect.left)+'px';rp.style.top=(e.clientY-rect.top)+'px';
                    this.appendChild(rp);setTimeout(()=>rp.remove(),500);
                });
            }

            const btn=document.createElement('button');btn.className='tp-send-btn';
            btn.textContent=isCounter?'Send New Trade':'Send Trade';
            addRipple(btn);card.appendChild(btn);

            let counterBtn=null;
            if(isCounter&&tradeSessionId){
                counterBtn=document.createElement('button');counterBtn.className='tp-counter-btn';
                counterBtn.textContent='Counter Trade #'+tradeSessionId;
                addRipple(counterBtn);card.appendChild(counterBtn);
            }

            const st=document.createElement('div');st.className='tp-send-st';card.appendChild(st);

            function getRobuxValues(){
                return {
                    myRobux:document.getElementById('tp-my-robux')?.value?(parseInt(document.getElementById('tp-my-robux').value,10)||null):null,
                    pRobux:document.getElementById('tp-part-robux')?.value?(parseInt(document.getElementById('tp-part-robux').value,10)||null):null
                };
            }

            function buildBody(myUserId,partUserId){
                const{myRobux,pRobux}=getRobuxValues();
                return{offers:[
                    {userId:parseInt(myUserId,10),userAssetIds:mySel.map(i=>guaid(i)),robux:(myRobux&&myRobux>0)?myRobux:null},
                    {userId:parseInt(partUserId,10),userAssetIds:partSel.map(i=>guaid(i)),robux:(pRobux&&pRobux>0)?pRobux:null}
                ]};
            }

            btn.addEventListener('click',async()=>{
                if(!mySel.length&&!partSel.length){st.className='tp-send-st tp-send-er';st.textContent='Select at least one item';return;}
                btn.disabled=true;if(counterBtn)counterBtn.disabled=true;
                st.className='tp-send-st';st.textContent='Sending...';
                try{await sendTrade(buildBody(myId,partId));st.className='tp-send-st tp-send-ok';st.textContent='Trade sent!';}
                catch(e){st.className='tp-send-st tp-send-er';st.textContent=e.message;}
                btn.disabled=false;if(counterBtn)counterBtn.disabled=false;
            });

            if(counterBtn){
                counterBtn.addEventListener('click',async()=>{
                    if(!mySel.length&&!partSel.length){st.className='tp-send-st tp-send-er';st.textContent='Select at least one item';return;}
                    btn.disabled=true;counterBtn.disabled=true;
                    st.className='tp-send-st';st.textContent='Sending counter...';
                    try{await counterTrade(tradeSessionId,buildBody(myId,partId));st.className='tp-send-st tp-send-ok';st.textContent='Counter sent!';}
                    catch(e){st.className='tp-send-st tp-send-er';st.textContent=e.message;}
                    btn.disabled=false;counterBtn.disabled=false;
                });
            }

            card._refresh=()=>{
                const p=card.parentElement;if(!p)return card;
                const nc=buildOfferCard(mySel,partSel,myId,partId,onChange);
                p.replaceChild(nc,card);offerEl=nc;return nc;
            };
            return card;
        }

        function findSec(hr) {
            const r={headerRow:hr,itemCol:null,pagCol:null};
            let el=hr.nextElementSibling;
            while(el){
                if((el.classList.contains('divider-top')&&el.classList.contains('mt-4')&&el.classList.contains('mb-4'))||
                   (el.matches('.row')&&el.querySelector('h3.font-size-14.fw-600'))||
                   el.classList.contains('tp-section'))break;
                if(!r.itemCol&&el.matches('.col-12.mt-4')&&el.querySelector('.itemRow-0-2-105'))r.itemCol=el;
                if(!r.pagCol&&el.matches('.col-3.mx-auto.mt-4')&&el.querySelector('.button-0-2-117'))r.pagCol=el;
                el=el.nextElementSibling;
            }
            return r;
        }

        function findAll() {
            const secs=[],seen=new Set(),col8=document.querySelector('.col-8');
            if(!col8)return secs;
            for(const h3 of col8.querySelectorAll('h3.font-size-14.fw-600')){
                const t=h3.textContent.trim();
                if((t==="My Inventory"||t==="Partner's Inventory")&&!seen.has(t)){
                    seen.add(t);const hr=h3.closest('.row');
                    if(hr){const s=findSec(hr);secs.push({label:t,...s,parent:hr.parentElement,isPartner:t.includes('Partner')});}
                }
            }
            return secs;
        }

        function hideOrig(s){s.headerRow.classList.add('tp-hidden');if(s.itemCol)s.itemCol.classList.add('tp-hidden');if(s.pagCol)s.pagCol.classList.add('tp-hidden');}
        function cleanup(){document.querySelectorAll('.tp-section,.tp-divider').forEach(e=>e.remove());document.querySelectorAll('.tp-hidden').forEach(e=>e.classList.remove('tp-hidden'));}

        async function inject() {
            if(injecting||injected)return;
            injecting=true;
            csrfToken=(document.cookie.match(/rbxcsrf4=([^;]+)/)||[])[1]||null;
            createToggle();
            applyTheme();

            let me;
            try{me=await getAuth();}catch{injecting=false;setTimeout(inject,2000);return;}
            const pid=getPartnerId();
            const secs=findAll();
            if(!secs.length){injecting=false;setTimeout(inject,500);return;}
            cleanup();injected=true;

            const mySel=[],partSel=[];
            let mySecEl=null,partSecEl=null;
            const origCol4=document.querySelector('.col-4');
            const origCard=origCol4?.querySelector('.offerRequestCard-0-2-34');
            let prefillMyRobux=0,prefillPartRobux=0;

            if(isCounter&&tradeSessionId){
                let prefillEl=null;
                if(origCol4){
                    if(origCard)origCard.classList.add('tp-hidden');
                    prefillEl=document.createElement('div');
                    prefillEl.className='tp-prefill-status tp-prefill-loading';
                    prefillEl.innerHTML='<div class="tp-spin"></div> Loading trade #'+tradeSessionId+'...';
                    origCol4.appendChild(prefillEl);
                }
                try{
                    const[info]=await Promise.all([fetchTradeInfo(tradeSessionId),fetchKolimons()]);
                    if(info&&Array.isArray(info.offers)){
                        for(const offer of info.offers){
                            const uid=String(offer.user?.id),isMe=uid===me.id,sel=isMe?mySel:partSel;
                            if(Array.isArray(offer.userAssets))for(const ua of offer.userAssets){if(sel.length<MAX_SELECT)sel.push(mapTradeItem(ua));}
                            if(isMe)prefillMyRobux=offer.robux||0;else prefillPartRobux=offer.robux||0;
                        }
                    }
                    if(prefillEl){
                        prefillEl.className='tp-prefill-status tp-prefill-ok';
                        prefillEl.innerHTML='✓ Loaded '+(mySel.length+partSel.length)+' items from trade #'+tradeSessionId;
                        setTimeout(()=>{try{prefillEl.style.transition='opacity .4s';prefillEl.style.opacity='0';setTimeout(()=>prefillEl.remove(),400);}catch{}},3000);
                    }
                }catch(e){
                    if(prefillEl){
                        prefillEl.className='tp-prefill-status tp-prefill-err';
                        prefillEl.textContent='Could not load trade #'+tradeSessionId+': '+e.message;
                        setTimeout(()=>{try{prefillEl.style.transition='opacity .4s';prefillEl.style.opacity='0';setTimeout(()=>prefillEl.remove(),400);}catch{}},5000);
                    }
                }
            }

            function refreshAll(){
                if(mySecEl?._render)mySecEl._render();
                if(partSecEl?._render)partSecEl._render();
                if(offerEl&&origCol4){
                    const nc=buildOfferCard(mySel,partSel,me.id,pid,refreshAll);
                    origCol4.replaceChild(nc,offerEl);offerEl=nc;
                }
            }

            if(origCard&&origCol4){
                origCard.classList.add('tp-hidden');
                offerEl=buildOfferCard(mySel,partSel,me.id,pid,refreshAll);
                origCol4.appendChild(offerEl);
                if(prefillMyRobux>0){const inp=document.getElementById('tp-my-robux');if(inp)inp.value=prefillMyRobux;}
                if(prefillPartRobux>0){const inp=document.getElementById('tp-part-robux');if(inp)inp.value=prefillPartRobux;}
            }

            secs.forEach(s=>{
                const uid=s.isPartner?pid:me.id,sel=s.isPartner?partSel:mySel;
                hideOrig(s);
                const divider=s.parent.querySelector('.mt-4.mb-4.divider-top');
                const ui=buildSection(s.label,uid,sel,refreshAll);
                if(s.isPartner){
                    partSecEl=ui;
                    if(divider){const d=document.createElement('hr');d.className='tp-divider';divider.classList.add('tp-hidden');divider.insertAdjacentElement('afterend',ui);ui.insertAdjacentElement('beforebegin',d);}
                    else s.parent.appendChild(ui);
                } else{mySecEl=ui;s.headerRow.insertAdjacentElement('afterend',ui);}
            });
            injecting=false;
        }

        if(document.readyState==='complete'||document.readyState==='interactive')setTimeout(inject,400);
        else document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,400));
        window.addEventListener('load',()=>setTimeout(inject,800),{once:true});
    })();

})();  // end main IIFE
