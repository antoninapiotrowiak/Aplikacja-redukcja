# Integracje AI i Apple Health

## Analiza posiłku przez AI

Analiza AI wymaga serwera Node.js i klucza Gemini API. Klucz jest używany wyłącznie po stronie serwera — nie wpisuj go w plikach HTML/JS ani w przeglądarce.

1. Zainstaluj Node.js 20.12 lub nowszy.
2. Skopiuj `.env.example` do `.env` i wpisz swój `GEMINI_API_KEY`.
3. Uruchom aplikację poleceniem `npm start`.
4. Otwórz adres wyświetlony w terminalu (domyślnie `http://127.0.0.1:4173`).
5. W dzienniku wybierz „Wyszukaj produkt lub zeskanuj kod”, dodaj opis lub zdjęcie i uruchom analizę.

Domyślnie serwer używa `gemini-3.8-flash`. Dostępność i darmowe limity zależą od modelu, regionu i bieżących zasad Google AI Studio. Wynik jest tylko szacunkiem. Aplikacja nie zapisuje go bez Twojego potwierdzenia. Zdjęcie i opis są wysyłane do serwera oraz Google Gemini w celu analizy. Wartości odżywcze mogą być niedokładne, szczególnie gdy nie widać wielkości porcji. Lokalny serwer nasłuchuje domyślnie tylko na `127.0.0.1`. Nie wystawiaj go do internetu bez uwierzytelniania, ograniczeń nadużyć i HTTPS. Nie umieszczaj `.env` w publicznym repozytorium.

Jeśli analiza się nie powiedzie, serwer pokaże kod HTTP oraz bezpieczny opis błędu Google. Dla 401/403 sprawdź klucz i jego ograniczenia; dla 404 sprawdź, czy `GEMINI_MODEL` jest dostępny dla tego klucza; dla 429 sprawdź limity projektu. Po zmianie `.env` uruchom serwer ponownie.

## Dane Apple Health

W profilu można ręcznie wczytać `export.xml` z archiwum utworzonego przez aplikację Zdrowie. Plik jest parsowany lokalnie w przeglądarce; wybrane podsumowania z ostatnich 90 dni są przechowywane w pamięci tej przeglądarki. Ponowny import zastępuje poprzedni import, a przycisk w profilu usuwa zapisane dane.

To nie jest automatyczna synchronizacja. Apple nie udostępnia HealthKit stronie/PWA. Synchronizacja na żywo wymaga natywnej aplikacji iOS, identyfikatora aplikacji, entitlementu HealthKit, zgód użytkownika i testów na urządzeniu Apple. Przygotowanie i podpisanie aplikacji wymaga Xcode na macOS.

## Widżety

Profil zawiera responsywne kafelki PWA z kaloriami i wodą, które działają w przeglądarce i po instalacji aplikacji webowej. Nie są to systemowe widżety iOS/Android. Widżet ekranu głównego iOS wymaga WidgetKit oraz natywnego targetu rozszerzenia; Android wymaga natywnego widgetu aplikacji. Sam manifest PWA nie może utworzyć takich widżetów.
