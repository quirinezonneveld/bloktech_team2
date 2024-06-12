# Ticket+

Dit project is een website die de Ticketmaster API gebruikt om evenementen te tonen op een website, deze evementen kunnen opgeslagen worden en heeft gebruikersregistratie.

## Inhoudsopgave

- [Beschrijving](#beschrijving)
- [Functies](#functies)
- [Dependencies](#dependencies)
- [Installatie](#installatie)
- [Gebruik](#gebruik)
- [Routes](#routes)
- [Contributie](#contributie)
- [Contributors](#contributors)
- [License](#license)

## Beschrijving

Dit project is een webapplicatie die gebouwd is met een combinatie van HTML, CSS, Node.js en Express.js. Het gebruikt de Ticketmaster API om evenementen weer te geven op de webapplicatie. Gebruikers kunnen zich registreren en de evenementen zoeken, filteren en opslaan als favorieten op hun profiel.

## Functies

- Evenementen weergeven uit de Ticketmaster API
- Evementen zoeken met behulp van een zoekbalk
- Evenementen filteren op de All-Events pagina
- Gebruikersregistratie en inloggen
- Gebruikers kunnen evenementen toevoegen en verwijderen aan hun favorieten
- Profielbeheer, waaronder wordt verstaan het kunnen toevoegen en verwijderen van profielfoto

## Dependencies

- axios
- bcrypt
- connect-mongo
- dotenv
- ejs
- express
- express-session
- mongodb
- multer
- node-fetch

## Installatie

Volg de volgende stappen om het project lokaal te installeren en uit te voeren

1. **Clone de repository:**

   ```bash
    git clone https://github.com/quirinezonneveld/ticketmaster-website.git
    cd ticketmaster-website
   ```
   
2. **Installeer de vereiste dependencies:**

  ```bash
    npm install
  ```
3. **Maak een '.env'**

Dit kan gedaan worden door het geleverde '.env-example' bestand te kopieren en de naam te wijzigen <br>
De .env komt er dan zo uit te zien:

  ```bash
    DB_HOST = 
    DB_NAME = 
    DB_USERNAME = 
    DB_PASSWORD = 
    SESSION_SECRET = 
    
    KEY =  
  ```

4. **Database connectie**

* Als je dit nog niet hebt gedaan, maak een account aan bij MongoDB
* Maak een nieuw cluster aan, volg de instructies van MongoDB om de configuratie te voltooinen
* Voeg het IP-adres toe van waaruit je toegang wilt hebben tot de database. Dit kan gedaan worden in de "Network Access" sectie van je clusterinstellingen
* Maak een nieuwe gebruiker aan, zorg ervoor dat deze voldoende rechten heeft om toegang te krijgen tot de database. Dit kan via de "Database Access" sectie
* Maak een verbinding tussen de applicatie en de database. Dit kan gedaan worden door de .env correct in te vullen met de juiste waardes. Hieronder staat een voorbeeld:

  ```bash
    DB_HOST = myHost
    DB_NAME = myName
    DB_USERNAME = myUserName
    DB_PASSWORD = myPassword
    SESSION_SECRET = mySessionSecret
    
    KEY = TicketmasterAPIKey
  ```

5. **Start de applicatie**
 
    ```bash
      node server.js
    ```

## Gebruik

   - **Homepagina:** De hoofdpagina geeft een overzicht van evenementen.
   - **Zoeken:** In de navigatie balk bevindt zich een zoekbalk waarmee met termen de evenementen kunnen worden opgezocht.
   - **Filteren:** Gebruikers kunnen op de All Events pagina filteren op de evenementen.
   - **Inloggen/Registreren:** Gebruikers kunnen zich inloggen en registreren om functies te gebruiken zoals het opslaan in favorieten.
   - **ProfielPagina:** Gebruikers kunnen op hun profielpagina een profielfoto toevoegen en hun favorieten zien en eventueel verwijderen.
    
## Routes
- **Home:**
  - 'GET /home' - Toon de homepagina
- **Evenementen:**
  - 'GET /all-events' - Toon alle evenementen
- **Gebruikers:**
  - 'GET /form'- Toon registratie- en inlogformulier 
  - `POST /registry` - Verwerk registratie van gebruikers.
  - `POST /login` - Verwerk inloggen van gebruikers.
  - `GET /profile` - Toon profielpagina.
  - `POST /upload-profile-picture` - Upload profielfoto.
  - `POST /delete-profile-picture` - Verwijder profielfoto.
  - `POST /unlike` - Verwijder evenement uit favorieten.
  - `GET /signout` - Uitloggen.
  - `POST /delete_profile` - Verwijder gebruikersaccount.
- **Foutafhandeling:**
  - `GET /error` - Toon foutpagina.
 
## Contributie

Toevoegingen aan het project zijn altijd welkom. Volg onderstaande stappen om mee te werken aan dit project. 

1. Fork deze repository.
2. Maak een nieuwe branch aan
3. Commit de wijzigingen 
4. Push naar de branch
5. Maak een pull requests aan.

Wij zullen regelmatig kijken naar de pull requests en zo nodig toevoegen aan het project.
 
## Contributors

- Quirine Zonneveld
- Karina Korytska
- Mischa Melkert
- Melvin Vermast

## License
Dit project is gelicentieerd onder de MIT-licentie. Zie het [LICENSE](LICENSE) bestand voor meer informatie.
