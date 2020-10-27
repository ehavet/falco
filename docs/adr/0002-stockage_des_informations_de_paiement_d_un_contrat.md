# Sauvegarde des informations de paiement d'un contrat

Date: 21/10/2020

## État

Accepté

## Contexte

Pour le moment aucune information de paiement n'est stockée chez nous lors de la souscription à une assurance habitation.
Ceci pose plusieurs problèmes :
 - une dépendance forte à Stripes concernant les données de paiement
 - une tracabilité difficile qui ne peut se faire que via le `policy_id` renseigné en tant que métadonnée lors de la création de l'intention de paiement et stockée chez Stripe

Qui peuvent entrainer des complications dans les cas suivant :
 - besoin de justifier certains paiements
 - remboursement d'un client suite à une annulation ou une rétractation
 - reporting et paiement auprès de MMA et gestion interne du comptable d'Appenin:
    - communication des nouveaux contrats en vigueur. Il y a des règles alambiquées, imposées par l'assureur, sur les bornes précises définissant la notion de "nouveaux contrats du mois en cours" qui doivent être inclus (en fait les contrats dont la date de début d'effet est entre deux bornes définies comme les dates légales de début et fin de mois moins 6 jours ouvrés, ce qui ouvre tout un tas de boites de Pandore comme celle de la liste des jours fériés retenus), donc il faut pour chaque contrat et chaque paiement qu'on décide si on l'inclue dans l'envoi du mois ou dans celui du mois suivant
    - virement du montant exact correspondant aux primes encaissées pour ces contrats à MMA
    - virement du compte d'exploitation d'Appenin vers le compte dédié à recevoir les primes clients afin de compenser les frais Stripe

Tout ça fait qu'on a à la fois besoin :
 - de pouvoir relier de manière sûre et fiable les paiements liés à un contrat pour les envois vers MMA
 - et de pouvoir stocker tous les paiements (pour leur valeur comptable) y compris quand ils ne sont pas ou plus lié à un contrat

## Décisions

Stocker une référence du paiement qui nous permette de lier le paiement sur Stripe à la policy et au client correspondant.
Attention, il peut y avoir plusieurs paiements pour une même policy (renouvellements annuels, ou paiements fractionnés mensuels par exemple) => une table `payment` distincte de la table `policy` est nécessaire.

De la même manière, on doit prévoir d'avoir des paiements non liés à des contrats.

On va donc créer une table `payment` en base de données dans laquelle seront stockés dans un premier temps les paiements effectués dans le cadre d'une première souscription à une assurance habitation.

Cette table contiendra les champs suivants :

```
id (random UUID)

amount (le montant à payer/payé)

psp_fee (montant des frais Stripe)

currency (toujours EUR)

processor (toujours STRIPE)

instrument (toujours CREDITCARD)

external_id (un identifiant issu de Stripe)

status (VALID ou CANCELLED, VALID pour les nouveaux paiements)

payed_at (date et heure du paiement)

cancelled_at (null par défaut, datetime si status=CANCELLED)

created_at (datetime auto as usual)

updated_at (datetime auto as usual)
```

Nous allons aussi créer une table d'association `payment_policy` qui servira à garder le lien entre le paiement et le contrat.
Le cycle de vie d'un paiement n'est pas lié au cycle de vie d'un contrat, ce qui veut dire :
 - qu'il n'y a pas de contrainte `DELETE ON CASCADE` sur la clé `policy_id` : si on supprime le contrat associé, on veut pouvoir garder les informations de paiement
 - qu'il y a une contrainte `DELETE ON CASCADE` sur la clé `payment_id` : si on supprime les informations de paiement, on supprime également l'entrée dans la table faisant le lien avec la policy

## Conséquences

Nous avons une table à disposition en base de données pour stocker les paiements réalisés dans le cadre d'un contrat ou de tout autre contexte.

Point d'attention : à voir si la structure actuelle suffira pour les besoins futurs ou si elle devra évoluer, et si oui comment.
