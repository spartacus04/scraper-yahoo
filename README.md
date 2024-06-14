# Documentazione per il Programma di Scaricamento Dati da Yahoo Finance

## Introduzione
Questo programma consente di scaricare dati finanziari da Yahoo Finance utilizzando dei proxy. Il programma richiede tre file di configurazione: `symbols.txt`, `config.json` e `agents.txt`. Il programma è fornito come eseguibile `.exe`.

## Requisiti
- Windows OS
- File `symbols.txt` contenente la lista dei simboli da scaricare
- File `config.json` con la configurazione delle operazioni di scaricamento
- File `agents.txt` con la lista di user agents da utilizzare per le richieste

## File `symbols.txt`
Questo file deve contenere una lista di simboli finanziari, uno per riga, che il programma utilizzerà per scaricare i dati da Yahoo Finance.

##### Esempio di `symbols.txt`
```
AAPL
GOOGL
MSFT
```

## File `agents.txt`
Questo file deve contenere una lista di user agents, uno per riga, che il programma utilizzerà per le richieste HTTP durante il download dei dati. Diversi user agents possono aiutare a evitare il blocco da parte del server.

##### Esempio di `agents.txt`
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15
Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0
```

## File `config.json`
Questo file contiene le impostazioni di configurazione per il programma. Deve essere formattato come un file JSON e include vari parametri come le date, la directory di output e i profili di scaricamento. Se le date per un certo dato non sono valide, sarà segnalato in `logs.txt`.

##### Struttura di `config.json`
```json
{
    "dates": {
        "profile": "auto",

        "profiles": {
            "auto": {
                "type": "diff",
                "years": 2,
                "months": 6,
                "days": 0
            },

            "setDates": {
                "type": "set",
                "startDate": "2023-06-01",
                "endDate": "2023-12-31"
            }
        }
    },

    "outputDir": "data",
    "mode": "fondamentali",
    "profiles": {
        "storico": [
            {
                "outTemplate": "${symbol}.txt",
                "baseUrl": "https://query1.finance.yahoo.com/v7/finance/download/${symbol}?period1=${START_DATE}&period2=${END_DATE}&interval=1d&events=history&includeAdjustedClose=true",
                "customErrorMessages": [
                    "<!DOCTYPE html>",
                    "<html>"
                ]
            }
        ],
        "fondamentali": [
            {
                "outTemplate": "summary_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}"
            },
            {
                "outTemplate": "profile_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}/profile"
            },
            {
                "outTemplate": "statistics_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}/key-statistics"
            },
            {
                "outTemplate": "financials_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}/financials"
            },
            {
                "outTemplate": "analysis_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}/analysis"
            }
        ],
        "all": [
            {
                "outTemplate": "${symbol}.txt",
                "baseUrl": "https://query1.finance.yahoo.com/v7/finance/download/${symbol}?period1=${START_DATE}&period2=${END_DATE}&interval=1d&events=history&includeAdjustedClose=true",
                "customErrorMessages": [
                    "<!DOCTYPE html>",
                    "<html>"
                ]
            },
            {
                "outTemplate": "summary_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}"
            },
            {
                "outTemplate": "profile_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}/profile"
            },
            {
                "outTemplate": "statistics_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}/key-statistics"
            },
            {
                "outTemplate": "financials_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}/financials"
            },
            {
                "outTemplate": "analysis_${symbol}.txt",
                "baseUrl": "https://finance.yahoo.com/quote/${symbol}/analysis"
            }
        ]
    }
}
```

### Descrizione dei Parametri di `config.json`
- `dates`: Impostazioni per le date di scaricamento.
  - `profile`: Profilo di date da utilizzare, può essere `auto` o `setDates`.
  - `profiles`: Dettagli sui profili di date.
    - `auto`: Calcola le date in base alla differenza specificata (`diff`).
      - `type`: Tipo di calcolo, in questo caso `diff`.
      - `years`: Numero di anni di differenza dalla data attuale.
      - `months`: Numero di mesi di differenza dalla data attuale.
      - `days`: Numero di giorni di differenza dalla data attuale.
    - `setDates`: Utilizza date fisse.
      - `type`: Tipo di date, in questo caso `set`.
      - `startDate`: Data di inizio del periodo di scaricamento nel formato `YYYY-MM-DD`.
      - `endDate`: Data di fine del periodo di scaricamento nel formato `YYYY-MM-DD`.

- `outputDir`: Directory di output dove verranno salvati i file scaricati.
- `mode`: Modalità di scaricamento. Può essere `storico`, `fondamentali` o `all`.
- `profiles`: Profili di scaricamento che definiscono le diverse modalità di scaricamento e i rispettivi URL di Yahoo Finance.

#### Profili di Scaricamento
- `outTemplate`: Template per il nome del file di output.
- `baseUrl`: URL base per il download di tutti i dati.
- `customErrorMessages`: Lista di messaggi di errore personalizzati per identificare risposte HTML non valide.

## Utilizzo del Programma
1. Creare un file `symbols.txt` con la lista dei simboli desiderati.
2. Creare un file `config.json` con le impostazioni di configurazione.
3. Creare un file `agents.txt` con la lista degli user agents.
4. Eseguire l'eseguibile `.exe`, specificando la cartella base dei file di configurazione come argomento da riga di comando.

### Esempio di Esecuzione
Doppio click sull'eseguibile `scarica_dati.exe` o eseguirlo tramite il prompt dei comandi, specificando la cartella base dei file di configurazione:
```bash
yahoo_downloader.exe C:\path\to\config\directory
```

## Note
- Assicurarsi che le date nel file `config.json` siano nel formato corretto.
- Verificare che la directory di output esista o che il programma abbia i permessi per crearla.
- Il programma utilizza dei proxy, quindi assicurarsi che le impostazioni del proxy siano configurate correttamente se necessario.
- I `customErrorMessages` sono utilizzati per identificare le risposte non valide che potrebbero essere restituite al posto dei dati attesi.
- Eventuali errori relativi alle date non valide saranno registrati nel file `logs.txt`.
- Diversi user agents nel file `agents.txt` possono aiutare a evitare il blocco da parte del server.

## Conclusione
Questa documentazione fornisce le informazioni necessarie per configurare e utilizzare il programma di scaricamento dati da Yahoo Finance. Seguendo le istruzioni fornite, sarà possibile scaricare i dati desiderati in modo efficace e organizzato.