#!/bin/bash

# Test a successful donation
curl -X POST http://localhost:3000/api/webhooks/every-org \
  -H "Content-Type: application/json" \
  -d '{
    "chargeId": "test-charge-'"$(date +%s)"'",
    "amount": "25.00",
    "netAmount": "24.12",
    "currency": "USD",
    "frequency": "ONCE",
    "donationDate": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
    "partnerDonationId": "test-uuid-'"$(uuidgen 2>/dev/null || echo $RANDOM)"'",
    "partnerMetadata": {
      "tmdb_id": 550,
      "media_type": "movie",
      "title": "Fight Club"
    },
    "toNonprofit": {
      "slug": "red-cross",
      "ein": "53-0196605",
      "name": "American Red Cross"
    },
    "firstName": "Test",
    "publicTestimony": "Great movie, wanted to give back",
    "paymentMethod": "card"
  }'

echo ""
echo "Webhook test sent!"
