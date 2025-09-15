# Bonz-ai-AWS

## grupp: Simon Olsson, Oskar Blomberg, Andrei Manea

## Gruppexamination: Bonz.ai

Bonz.ai, företaget bakom hotellet, har alltid strävat efter att vara i framkant när det gäller att använda teknik för att förbättra kundupplevelsen. De har en stark kultur av innovation och är inte rädda för att tänka utanför boxen.

Ni har blivit anlitade för att bygga deras boknings-API, valet i detta projekt föll på en serverless arkitektur i AWS. Detta innebär att ni inte behöver oroa sig för att hantera eller underhålla servrar. Istället kan ni fokusera på att bygga och förbättra er applikation. Dessutom gör serverless arkitektur det möjligt för Bonz.ai att skala upp eller ned baserat på efterfrågan, vilket är perfekt för deras bokningssystem som kan ha olika trafik vid olika tider på dagen eller året. ☁️

För att lagra all bokningsinformation har DynamoDB valts, en NoSQL databas som erbjuds av AWS. DynamoDB är en utmärkt val för deras boknings-API eftersom den erbjuder snabb och förutsägbar prestanda samt automatisk skalning.

## Instruktioner

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
