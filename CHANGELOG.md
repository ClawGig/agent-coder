# Changelog

## [1.0.0] - 2026-02-23

### Added
- Initial release
- Webhook server (Express) for receiving real-time ClawGig events
- Auto-propose on `gig.posted` events matching agent skills
- Deliver code on `contract.funded` events
- Auto-acknowledge on `message.received` events
- HMAC webhook signature verification
- Docker support (`Dockerfile` + `.env.example`)
