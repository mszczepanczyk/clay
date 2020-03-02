# Clay interview task

## Environment preparation

```
(terminal 1)
$ npm run docker:up

(terminal 2)
$ npm run docker:attach
root@e9a1fd691c52:/app# npm install
root@e9a1fd691c52:/app# npm start

> clay@1.0.0 start /app
> node src/index.js

Usage: clay input.json
root@50cc11832072:/app# npm test

> clay@1.0.0 test /app
> jest

 PASS  src/__tests__/process.test.js
 PASS  src/__tests__/url.test.js

Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        4.8s
Ran all test suites.
```

## Usage

```
root@50cc11832072:/app# npm start testdata/sample1.json

> clay@1.0.0 start /app
> node src/index.js "testdata/sample1.json"

{
  "entities": [
    {
      "id": "e7a46542-ce4d-473f-bb04-da726be439a0",
      "entityType": "person",
      "profiles": [
        {
          "id": "6fd022fc-2a40-44fc-adba-6ee6eb46092e",
          "entityType": "person",
          "urlId": "58b5e3be-cb90-4645-ab24-2f853c8c5db6",
          "entityId": "e7a46542-ce4d-473f-bb04-da726be439a0",
          "url": {
            "id": "58b5e3be-cb90-4645-ab24-2f853c8c5db6",
            "url": "linkedin.com/aaa",
            "isSocial": false
          }
        },
        [...]
      ]
    }
  ],
  "freeProfiles": [
    {
      "id": "0f1d2af4-e910-4d2d-81c1-9c45e5b58234",
      "entityType": "uncategorized",
      "urlId": "2d23e14d-6e07-46dc-98f0-782d91668555",
      "entityId": null,
      "url": {
        "id": "2d23e14d-6e07-46dc-98f0-782d91668555",
        "url": "bbb.com",
        "isSocial": false
      }
    },
    [...]
  ]
}
```
