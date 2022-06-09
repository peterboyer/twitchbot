# twitchbot

Currently, this is a bot (written in NodeJS/TypeScript) that automatically
acknowledges (to my Twitch channel's[1] chat) all incoming charity donations
made to my team[2] for The Shitbox Rally[3], raising money for the Cancer
Council[4] to `!fightcancer`.

- [1] [@peterboyer_ (Twitch)](https://www.twitch.tv/peterboyer_) -- Follow to
  catch my next stream working on this bot project!
- [2] [My Shitbox Rally Team's Donation
  Page](https://spring2022.shitboxrally.com.au/2-bros-chillin-in-a-shitbox) --
  Donations of any size are so incredibly appreciated, thank you in advance!
  (Donations may be made anonymously, and may also be tax deductible.)
- [3] [Shitbox Rally](https://www.shitboxrally.com.au/)
- [4] [Cancer Council](https://www.cancer.org.au/)

- nodejs, to coordinate
- gmail, via node-imap, to listen for new donation emails to trigger scrape
- fetch/cheerio, to scrape donations feed page for diffing
- diff, to compare scraped donations arrays
- redis, to store previous donations from last scrape
- twitch chat, via tmi.js, to say "thank you" messages to chat

## Future

The `!ass` bot: "(A)ffiliate (S)ubstitution (S)ervice" -- for those who want
delight in all the cool perks of being an affiliate streamer on Twitch; without
having to fill out all those tax forms and having to start running ads on their
stream just to enjoy channel points and emote redemptions. We can write our own
service to track such things, and use `!chat` commands as an interface.

I also want this to eventually be available as a Docker container, configurable
with a `json` or `yaml` file to configure custom `!chat` commands, and maybe
even support a simple `.js` file-loader based modification system for hooking
mapping custom logic responses and/or middleware.

## Config

```shell
# required
TWITCH_CLIENT_ID        # client id of twitch developer app for bot
TWITCH_CLIENT_SECRET    # client secret of twitch developer app for bot
TWITCH_REFRESH_TOKEN    # oauth refresh token to exchange for access token, use twitch-cli[1]
TWITCH_USERNAME         # username of the account used for the bot ("PeterBoyerBot")
TWITCH_CHANNEL          # username of the channel to send messages to ("PeterBoyer_")

# required (for charity donations tracking module)
IMAP_USER               # imap username (i.e. for gmail, it is your full email address)
IMAP_PASSWORD           # imap password (i.e. for gmail, create an new app password to use here)
IMAP_HOST               # imap host (i.e. for gmail, "imap.gmail.com")
IMAP_PORT               # imap port (i.e. for gmail, "993")

# optional
REDIS_RESET             # if truthy/non-empty, will write [] empty array to donations store
```

- [1] Use the Twitch CLI to get a Refresh Token from an oauth redirect flow with your app:
  ```shell
  # log into the twitch cli and use your client_id and client_secret when prompted
  twitch

  # follow the oauth flow with your BOT account logged into your browser
  twitch token -u -s 'chat:read chat:edit'

  # copy the refresh token from the terminal to use as an environment variable
  ...
  ```
