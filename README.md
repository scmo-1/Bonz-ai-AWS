# Gruppexamination: Bonz-ai-AWS

## grupp: Simon Olsson, Oskar Blomberg, Andrei Manea

## Användarinformation

En .env-fil behöver skapas. Den ska innehålla följande två nycklar: <br>
**ORG=**{din organisation} <br>
**IAM=**{en roll med relevanta behörigheter}

För att skapa/ändra data ska request body innehålla nedanstående nycklar enligt följande format:

```
{
  "name":"Jack Torrance",
  "email":"allworkandnoplay@mail.com",
  "guests": 3,
  "rooms":{
    "single": 1,
    "double": 1,
    "suite": 1
  },
  "checkIn":"2025-09-10",
  "checkOut":"2025-09-13"
}
```

Vad gäller rooms-objektet behöver endast aktuella rumstyper anges. Följande är alltså acceptabelt:

```
"rooms":{
  "suite": 1
}
```

#### Kravspecifikation och user stories

En gruppmedlem gör ett repo och bjuder in resterande gruppmedlemmar till det repot. Sedan under fliken Projects så välj ett nytt projekt och kopiera över alla user stories. Utifrån dessa user stories så dela upp dessa i mer tekniska tasks som ni kan arbeta utifrån.

**Ni behöver inte ha någon inloggning eller skapa konto**

User stories: https://github.com/orgs/JS22-backend-fordjupning/projects/2/views/1

**Affärslogik**

_Rum_

- Det finns totalt **20 rum** på hotellet som kan bokas dock behöver man inte ta hänsyn till datum (men man får).
- Det finns tre typer av rum:
  - Enkelrum som tillåter enbart en 1 gäst
  - Dubbelrum som tillåter 2 gäster
  - Svit som tillåter 3 gäster
- Enkelrum kostar 500 kr / natt
- Dubbelrum kostar 1000 kr / natt
- Svit kostar 1500 kr / natt
- Det går att ha olika typer av rum i en bokning men antalet gäster måste stämma överens med ovan logik. Exempel: 3 personer behöver antingen boka en svit eller ett enkelrum och ett dubbelrum.

#### Tekniska krav

- Serverless framework
- API Gateway
- AWS Lambda
- DynamoDB
- Det finns felhantering ifall något går fel mot DynamoDB och ifall man försöker skicka in fel värden från body.
