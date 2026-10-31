
(function () {
  const html = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <linearGradient id="g-fogo" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f08a24"/><stop offset=".55" stop-color="#e8501f"/><stop offset="1" stop-color="#b2312a"/></linearGradient>
  </defs>
    <symbol id="cena-jacu" viewBox="0 0 64 64">
      <path d="M9 51 Q32 45 57 52"/>
      <path d="M22 22 Q22 15 29 15 Q35 16 35 22 Q42 24 46 33 Q49 42 41 46 Q30 48 24 40 Q21 33 22 27"/>
      <path d="M43 39 L58 46 L56 50 L40 45"/>
      <path d="M22 20 L14 22 L22 25"/>
      <path d="M32 47 L31 51 M38 46 L37 50"/>
      <path d="M31 31 Q40 31 42 40"/>
      <circle cx="28" cy="20" r="1" style="fill:var(--tinta);stroke:none"/>
      <path d="M22 26 Q23 32 27 30 Q26 26 22 26Z" style="fill:var(--shu);stroke:none"/>
      <circle cx="13" cy="48" r="2.8" style="fill:var(--shu);stroke:none"/>
      <circle cx="51" cy="50" r="2.8" style="fill:var(--shu);stroke:none"/>
    </symbol>
    <symbol id="cena-elefante" viewBox="0 0 64 64">
      <path d="M14 48 Q10 47 11 41 Q12 34 15 30 Q14 20 24 17 Q32 13 42 16 Q53 18 54 30 L54 46 L48 46 L47 38 L42 38 L41 46 L35 46 L34 39 L27 39 L26 46 L20 46 L20 38"/>
      <path d="M22 24 Q30 21 31 30 Q30 38 22 36 Q19 30 22 24Z"/>
      <path d="M54 30 Q58 34 56 42"/>
      <circle cx="18" cy="25" r="1" style="fill:var(--tinta);stroke:none"/>
      <path d="M13 31 Q16 33 16 37" />
      <circle cx="40" cy="25" r="2.6" style="fill:var(--shu);stroke:none"/>
      <path d="M8 52 Q32 49 58 52"/>
    </symbol>
    <symbol id="cena-civeta" viewBox="0 0 64 64">
      <path d="M8 41 L15 34 Q18 31 22 32 Q36 28 48 33 Q52 36 50 44 L48 47"/>
      <path d="M8 41 Q10 44 15 43 Q30 45 46 43"/>
      <path d="M18 33 L19 28 L23 32"/>
      <path d="M48 34 Q61 31 58 15"/>
      <path d="M52 32 L53 36 M56 28 L58 31 M58 22 L61 23 M58 17 L61 17"/>
      <path d="M22 38 L21 48 M28 40 L27 48 M42 40 L41 48 M47 40 L48 48"/>
      <path d="M13 36 Q15 38 17 36 Q15 34 13 36Z" style="fill:var(--shu);stroke:none"/>
      <circle cx="12" cy="38" r="1" style="fill:var(--tinta);stroke:none"/>
      <path d="M6 52 Q32 49 58 52"/>
    </symbol>
    <symbol id="cena-vulcao" viewBox="0 0 64 64">
      <path d="M4 52 L24 25 Q28 21 32 21 Q36 21 40 25 L60 52"/>
      <path d="M25 24 Q29 27 32 24 Q35 27 39 24"/>
      <path d="M12 17 Q10 11 16 11 Q18 7 23 10 Q29 9 29 15 Q29 17 26 17 L14 17Z"/>
      <path d="M8 46 Q32 41 56 46" style="stroke-dasharray:3 3"/>
      <circle cx="22" cy="52" r="2.4" style="fill:var(--shu);stroke:none"/>
      <circle cx="31" cy="49" r="2.4" style="fill:var(--shu);stroke:none"/>
      <circle cx="42" cy="52" r="2.4" style="fill:var(--shu);stroke:none"/>
      <path d="M4 57 Q32 54 60 57"/>
    </symbol>
    <symbol id="cena-ilha" viewBox="0 0 64 64">
      <path d="M8 46 L13 36 L18 38 L24 24 L30 28 L36 19 L44 30 L50 33 L56 46"/>
      <path d="M3 51 Q8 47 13 51 T23 51 T33 51 T43 51 T53 51 T61 51"/>
      <path d="M3 57 Q8 53 13 57 T23 57 T33 57 T43 57 T53 57 T61 57"/>
      <circle cx="50" cy="14" r="4" style="fill:var(--shu);stroke:none"/>
      <path d="M17 38 L17 46 M30 28 L30 46" style="stroke-opacity:.5"/>
    </symbol>
    <symbol id="cena-montanha" viewBox="0 0 64 64">
      <path d="M3 38 L17 16 L25 27 L36 8 L61 38"/>
      <path d="M8 31 Q16 28 24 31 M30 22 Q38 19 46 23 M12 35 Q26 32 40 35 Q48 33 56 36" style="stroke-opacity:.6"/>
      <path d="M23 43 Q21 52 23 60 L41 60 Q43 52 41 43 Z"/>
      <ellipse cx="32" cy="43" rx="9" ry="2.2"/>
      <path d="M22.4 49 Q32 51.5 41.6 49 M22.4 55 Q32 57.5 41.6 55" style="stroke:var(--shu)"/>
    </symbol>
    <symbol id="grao" viewBox="0 0 64 64"><g transform="rotate(30 32 32)"><ellipse cx="32" cy="32" rx="16" ry="23" style="fill:var(--grao,#4a3326);stroke:#241711;stroke-width:1.5"/><path d="M32 10 Q22 24 32 32 Q42 40 32 54" style="fill:none;stroke:#d9bf99;stroke-width:2.2"/></g></symbol>
    <symbol id="flor" viewBox="0 0 64 64"><g style="fill:#fffaf0;stroke:#2a2622;stroke-width:1.2"><ellipse cx="32" cy="17" rx="7" ry="12"/><ellipse cx="32" cy="17" rx="7" ry="12" transform="rotate(72 32 32)"/><ellipse cx="32" cy="17" rx="7" ry="12" transform="rotate(144 32 32)"/><ellipse cx="32" cy="17" rx="7" ry="12" transform="rotate(216 32 32)"/><ellipse cx="32" cy="17" rx="7" ry="12" transform="rotate(288 32 32)"/></g><circle cx="32" cy="32" r="4.5" style="fill:#e3b83f;stroke:none"/></symbol>
    <symbol id="folha" viewBox="0 0 64 64"><path d="M4 32 Q32 6 60 32 Q32 58 4 32Z" style="fill:#4a6741;stroke:#2f4a2c;stroke-width:1.5"/><path d="M4 32 H60" style="stroke:#a9c79f;stroke-width:1.5"/></symbol>
    <symbol id="cereja" viewBox="0 0 64 64"><circle cx="32" cy="36" r="17" style="fill:var(--shu);stroke:#7d1f1a;stroke-width:1.5"/><path d="M32 19 Q34 10 42 8" style="fill:none;stroke:#4a6741;stroke-width:2.5"/><path d="M24 30 Q26 26 30 25" style="fill:none;stroke:#f0b9a8;stroke-width:2"/></symbol>
    <symbol id="chama" viewBox="0 0 64 64"><path d="M32 62 C14 62 8 44 18 30 C20 38 24 40 26 40 C24 28 30 16 36 2 C38 18 56 28 54 46 C54 56 46 62 32 62Z" style="fill:url(#g-fogo);stroke:none"/><path d="M32 62 C22 62 20 52 26 44 C28 48 30 48 32 46 C34 40 38 40 40 50 C42 58 38 62 32 62Z" style="fill:#ffd98a;stroke:none"/></symbol>
    <symbol id="foice" viewBox="0 0 64 64"><path d="M8 61 L30 32" style="stroke:#6b4a2f;stroke-width:5.5;fill:none"/><path d="M28 34 Q10 8 44 4 Q60 3 62 14 Q42 12 36 28 Q33 36 28 34Z" style="fill:#aeb3b7;stroke:#2a2622;stroke-width:1.5"/><path d="M44 7 Q27 9 31 24" style="stroke:#f4f6f8;stroke-width:1.5;fill:none"/></symbol>
    <symbol id="navio" viewBox="0 0 64 64"><path d="M4 42 H60 L52 54 H12 Z" style="fill:#3b3631"/><rect x="14" y="31" width="12" height="11" style="fill:var(--shu)"/><rect x="26" y="31" width="12" height="11" style="fill:#c9b79a"/><rect x="38" y="31" width="12" height="11" style="fill:var(--shu)"/><rect x="20" y="22" width="12" height="9" style="fill:#c9b79a"/><path d="M42 31 V20 H49 V31" style="fill:#e8dcc6"/><path d="M2 59 Q8 55 14 59 T26 59 T38 59 T50 59 T62 59" style="fill:none"/></symbol>
    <symbol id="aviao" viewBox="0 0 64 64"><path d="M3 36 Q7 28 28 28 L57 30 Q63 32 59 36 L28 40 Q8 40 3 36Z" style="fill:#f5ecdf"/><path d="M28 30 L40 10 L48 10 L40 30" style="fill:#e0d3bf"/><path d="M52 30 L56 17 L62 17 L59 31" style="fill:#e0d3bf"/><path d="M11 34 H13 M17 34 H19 M23 34 H25 M29 34 H31" style="fill:none"/><path d="M6 38 H54" style="stroke:var(--shu);stroke-width:2;fill:none"/></symbol>
    <symbol id="saca" viewBox="0 0 64 64"><path d="M18 16 Q32 22 46 16 L52 28 Q56 46 50 56 Q32 61 14 56 Q8 46 12 28Z" style="fill:#d8c39d"/><path d="M18 16 L22 9 H42 L46 16" style="fill:#c4ad80"/><path d="M22 38 H42 M24 45 H40" style="stroke:var(--shu);stroke-width:2.2;fill:none"/></symbol>
    <symbol id="cesto" viewBox="0 0 64 64"><path d="M10 30 Q32 4 54 30" style="fill:none"/><path d="M10 30 H54 L48 58 H16 Z" style="fill:#c79a5b"/><path d="M12 38 H52 M14 46 H50 M16 53 H48 M24 30 L22 58 M32 30 V58 M40 30 L42 58" style="fill:none;stroke-opacity:.55"/><circle cx="19" cy="27" r="6" style="fill:var(--shu);stroke:#7d1f1a"/><circle cx="30" cy="23" r="6" style="fill:var(--shu);stroke:#7d1f1a"/><circle cx="41" cy="25" r="6" style="fill:var(--shu);stroke:#7d1f1a"/><circle cx="49" cy="29" r="5" style="fill:var(--shu);stroke:#7d1f1a"/></symbol>
    <symbol id="ramo" viewBox="0 0 64 64"><path d="M6 58 Q30 42 58 10" style="stroke:#4a3326;stroke-width:3;fill:none"/><ellipse cx="22" cy="38" rx="11" ry="5" transform="rotate(-35 22 38)" style="fill:#4a6741;stroke:#2f4a2c"/><ellipse cx="42" cy="22" rx="11" ry="5" transform="rotate(-50 42 22)" style="fill:#4a6741;stroke:#2f4a2c"/><circle cx="30" cy="48" r="5" style="fill:var(--shu);stroke:#7d1f1a"/><circle cx="37" cy="44" r="5" style="fill:var(--shu);stroke:#7d1f1a"/><circle cx="48" cy="30" r="5" style="fill:var(--shu);stroke:#7d1f1a"/><circle cx="53" cy="22" r="5" style="fill:var(--shu);stroke:#7d1f1a"/></symbol>
    <symbol id="barril" viewBox="0 0 64 64"><path d="M18 10 Q9 32 18 56 L46 56 Q55 32 46 10Z" style="fill:#b98c55"/><ellipse cx="32" cy="10" rx="14" ry="3.5" style="fill:#d1a96e"/><path d="M12.5 22 Q32 28 51.5 22 M11.5 44 Q32 50 52.5 44" style="stroke:var(--shu);stroke-width:2.5;fill:none"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", html);
})();
