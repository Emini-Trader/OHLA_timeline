# NORMA / OHLA – zasoby i finanse

Aplikacja ma dwie zakładki w nagłówku:

| Zakładka (NO / EN) | Zawartość | Adres |
|---|---|---|
| **Ressurser / Resources** | oś czasu zasobów (domyślna) | `/` lub `/#ressurser` |
| **Økonomi / Financials** | dashboard finansowy i kalkulator rentowności projektu | `/#okonomi` |
| **Teamstruktur / Team Structure** | organizacja zespołu pomiarowego, rozwój, współpraca, ciągłość | `/#teamstruktur` |

Zakładki, przełącznik języka NO/EN i motyw jasny/ciemny tworzą jedną grupę kontrolek w istniejącym nagłówku.

## Struktura

```
public/                 ← jedyny katalog serwowany publicznie (vercel.json → outputDirectory)
  index.html            oś czasu + zakładki + router (#ressurser / #okonomi)
  css/okonomi.css       style sekcji Økonomi (tokeny marki NORMA, tryb jasny/ciemny)
  js/okonomi.mjs        UI: logowanie, dashboard, wykresy SVG, kalkulator, teksty NO/EN
  js/finance/calc.mjs   czyste funkcje obliczeniowe (bez danych, bez DOM)
  js/finance/schema.mjs walidacja struktury danych
  js/team.mjs           UI zakładki Teamstruktur (diagram SVG, etapy, współpraca, ciągłość)
  js/team/team-data.mjs dane struktury zespołu z odwołaniami do komórek arkusza
  css/team.css          style zakładki Teamstruktur
api/                    funkcje serwerowe Vercel (Node)
  financials.js         GET  – dane tylko po zalogowaniu
  login.js / logout.js  POST – sesja w ciasteczku HttpOnly
  _lib/                 auth (scrypt + HMAC), ładowanie danych, dane przykładowe (syntetyczne)
scripts/
  extract_financials.py arkusze XLSX → JSON z odwołaniami do komórek (dane poufne – poza repo!)
  hash-password.mjs     generuje FIN_PASSWORD_HASH i FIN_SESSION_SECRET
  dev-server.mjs        lokalny serwer (public/ + api/)
  check.mjs             kontrola składni + blokada plików danych w public/
test/                   node:test – formuły, kontrola dostępu, walidacja na prawdziwych danych (lokalnie)
```

## Poufność danych

Repozytorium jest **publiczne**, dlatego żadne prawdziwe dane finansowe nie są w Git ani w `public/`.

- Prawdziwe dane są przekazywane wyłącznie jako zmienna środowiskowa `NORMA_FIN_DATA` w Vercelu (zakodowany base64 JSON).
- `/api/financials` zwraca je **tylko z ważną sesją**. Hasło jest sprawdzane na serwerze (hash scrypt), a sesja to podpisane HMAC ciasteczko `HttpOnly; Secure; SameSite=Strict` ważne 8 godzin.
- Zasada „fail closed”: jeśli dane są ustawione, a logowanie nie, serwer zwraca 503 i nie wysyła niczego.
- Bez skonfigurowanych danych zakładka pokazuje wyraźnie oznaczone **dane przykładowe** (syntetyczne).
- Odpowiedzi API mają nagłówki `Cache-Control: no-store` i `X-Robots-Tag: noindex`.
- `.gitignore` blokuje `*.xlsx`, pliki `*.b64` i `financials*.json`.

### Wdrożenie z prawdziwymi danymi (Vercel → Settings → Environment Variables)

1. Hasło i sekret sesji:
   ```bash
   npm run hash-password
   ```
   Ustaw `FIN_PASSWORD_HASH` i `FIN_SESSION_SECRET` z wyniku (hasło: min. 12 znaków).
2. Dane (poza katalogiem repo; potrzebny `pip install openpyxl`):
   ```bash
   python3 scripts/extract_financials.py --financial "FINANCIAL ANALYSIS.xlsx" --calculation "Kalkulacja zysku projektowego.xlsx" --year 2026 --out ~/norma/financials.json --base64 ~/norma/financials.b64
   ```
   Zawartość `financials.b64` wklej jako `NORMA_FIN_DATA`.
3. Ustaw te trzy zmienne **tylko dla środowiska Production**. Wtedy podglądy (preview) nie dostaną prawdziwych danych. Jeśli chcesz danych także w podglądach, włącz dodatkowo Vercel Deployment Protection.
4. Zrób redeploy.

## Rozwój i testy

```bash
npm run dev          # http://localhost:3000 (dane przykładowe)
npm test             # testy formuł i kontroli dostępu
npm run build        # check + testy (tak samo jak na Vercelu)
NORMA_FIN_DATA_FILE=~/norma/financials.json npm test   # dodatkowo walidacja na prawdziwych arkuszach
```

Lokalnie przez `http://` serwer deweloperski używa ciasteczka bez flagi `Secure` (`FIN_DEV_INSECURE_COOKIE=1`, ustawiane automatycznie przez `npm run dev`). Nie ustawiaj tej zmiennej na Vercelu.

## Metodologia i poprawki względem arkuszy

**FINANCIAL ANALYSIS (arkusz `Ark1`)**
- Dane księgowe: maj–październik 2026. Rok potwierdził właściciel, w arkuszu go nie ma.
- Sumy są liczone z pozycji kont i porównywane z formułami arkusza (L4, L14, L30, L31, L32).
- Arkusz nie przypisuje wyniku wyłącznie do kontraktu OHLA, więc dashboard pokazuje go jako wynik operacyjny spółki.
- Porównanie stawek to **model**:
  - stawka × godziny: 165 h dla czterech usług, 80 h monitoring, 20 h wsparcie projektowe;
  - kolumna „MARKED” to założenia z arkusza, a nie zweryfikowane średnie rynkowe;
  - średnia faktura (C35, wpisana ręcznie) jest pokazana osobno.

**Kalkulacja zysku projektowego**
- Formuły jak w arkuszu: wynagrodzenie/12, feriepenger, AGA, AGA od feriepenger, OTP, AGA od OTP. Arkusz „Projekt OHLA mengdeberegner” odtwarza się co do grosza.
- **Poprawki:**
  1. Odzież robocza jest wliczana do kosztów. Arkusze `produksjonsstikker`, `stikningsleder` i `Projekt Sotra rev2` pomijały ją w sumie `D21:D25`.
  2. Sztywne macierze stawek i marż zastąpiono scenariuszem obniżki ceny i tabelą wrażliwości liczonymi na bieżąco.
  3. Dzielenie przez zero daje „–” zamiast `#DIV/0!`.
  4. Pola edytowalne (białe) są wizualnie oddzielone od wartości wyliczonych (szare).
  5. Rozróżnione pojęcia: wynik projektu (NOK), marża (wynik/przychód) i narzut (wynik/koszty).
  6. Kalkulator startuje od pustego szablonu; założenia historyczne trzeba wybrać świadomie i są oznaczone.
  7. Koszt personelu to suma po pracownikach (każdy z własną pensją). Godziny fakturowane są podawane łącznie dla projektu, więc rotacja 14/14 nie podwaja godzin.
- **Feriepenger:** metoda arkusza dolicza 10,2% do pełnej pensji za 12 miesięcy. Jeśli roczna kwota już zawiera feriepenger, zaznacz opcję „Årslønn inkluderer feriepenger”, a kalkulator rozdzieli kwotę zamiast doliczać (bez podwójnego liczenia).
- Wynik projektu nie obejmuje kosztów ogólnych spółki ani podatku, więc nie jest zyskiem netto.

## Teamstruktur – źródła i interpretacja

Dane pochodzą z `NORMA_struktura-survey team.xlsx` (arkusz `Ark1`; diagram narysowany scalonymi komórkami i obramowaniami) oraz z raportu organizacyjnego. Każda rola i organizacja ma w `team-data.mjs` zakres komórek i oryginalną etykietę. Sekcja jest publiczna jak zakładka Ressurser: zawiera role i udziały zasobów, bez danych finansowych.

- **Obecny zespół NORMA:** Lead Surveyor 100%, Quantity Surveyor/GK 50%, dwie zmiany dzienne po 75%. Udziały nie są sumowane do liczby osób.
- **Plany:**
  - tunel (`(tunnel) FIELDWORK 100%`, L24) jest pokazany jako *planowany*, zgodnie z raportem (jaśniejsze wypełnienie w arkuszu);
  - szare komórki Q12:Q14 i Q16:Q18 oznaczają planowany wzrost zmian dziennych z 75% do 100%.
- **METROSTAV** to zewnętrzny partner, a nie zasób NORMA. Etykieta „METROSTAV 100%” jest zachowana tylko jako źródło.
- **Linie bez legendy w arkuszu**, interpretacja:
  - czarne – relacje organizacyjne;
  - czerwone – wymiana danych przez Trimble Connect;
  - zielone – dane z terenu do Quantity Surveyor;
  - jedna linia od Trimble Connect kończy się przy połączeniu SVV–biuro i **nie** jest interpretowana jako korzystanie z platformy przez SVV.
- Źródła nie podają dat ani nazw trzech środowisk obliczeniowych, dlatego nie są pokazane.
- Obowiązki pracowników terenowych pochodzą z zestawienia zasobów (zakładka Ressurser).
