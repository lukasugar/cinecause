#!/bin/bash

API_URL="https://cinecause-staging.vercel.app/api/webhooks/every-org"
AUTH_TOKEN="ACTUAL_TOKEN_VALUE"

# Seed multiple test donations
echo "Seeding test donations..."

# Fight Club - 2 donations
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "chargeId": "seed-1-'"$(date +%s)"'",
    "amount": "25.00",
    "currency": "USD",
    "frequency": "ONCE",
    "donationDate": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
    "partnerMetadata": {"tmdb_id": 550, "media_type": "movie", "title": "Fight Club"},
    "toNonprofit": {"slug": "red-cross", "name": "American Red Cross"},
    "firstName": "Alice"
  }'
echo "Seeded: Fight Club - \$25.00"

sleep 1

curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "chargeId": "seed-2-'"$(date +%s)"'",
    "amount": "50.00",
    "currency": "USD",
    "frequency": "ONCE",
    "donationDate": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
    "partnerMetadata": {"tmdb_id": 550, "media_type": "movie", "title": "Fight Club"},
    "toNonprofit": {"slug": "doctors-without-borders", "name": "Doctors Without Borders"},
    "firstName": "Bob"
  }'
echo "Seeded: Fight Club - \$50.00"

sleep 1

# Interstellar
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "chargeId": "seed-3-'"$(date +%s)"'",
    "amount": "100.00",
    "currency": "USD",
    "frequency": "ONCE",
    "donationDate": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
    "partnerMetadata": {"tmdb_id": 157336, "media_type": "movie", "title": "Interstellar"},
    "toNonprofit": {"slug": "space-foundation", "name": "Space Foundation"},
    "firstName": "Carol"
  }'
echo "Seeded: Interstellar - \$100.00"

sleep 1

# The Godfather
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "chargeId": "seed-4-'"$(date +%s)"'",
    "amount": "75.00",
    "currency": "USD",
    "frequency": "ONCE",
    "donationDate": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
    "partnerMetadata": {"tmdb_id": 238, "media_type": "movie", "title": "The Godfather"},
    "toNonprofit": {"slug": "unicef", "name": "UNICEF"},
    "firstName": "David"
  }'
echo "Seeded: The Godfather - \$75.00"

sleep 1

# Schindler's List
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "chargeId": "seed-5-'"$(date +%s)"'",
    "amount": "200.00",
    "currency": "USD",
    "frequency": "ONCE",
    "donationDate": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
    "partnerMetadata": {"tmdb_id": 424, "media_type": "movie", "title": "Schindlers List"},
    "toNonprofit": {"slug": "holocaust-museum", "name": "Holocaust Museum"},
    "firstName": "Eve"
  }'
echo "Seeded: Schindler's List - \$200.00"

echo ""
echo "Done! Seeded 5 test donations totaling \$450.00"
