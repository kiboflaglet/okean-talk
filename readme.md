## Design

https://dribbble.com/shots/24998881-Rentable-Rental-Order-Card-View-in-SaaS-Rental-Management

## User stories
```
| User can login with google account |   • Google OAuth
  • Supabase
  • https://www.youtube.com/watch?v=2SEz6SK_ekE
  • Logout
  • Cannot change account name
  • Extra table in Supabase and connect that table to google auth |
| --- | --- |
| User can see public rooms |   • All public rooms listed on home page 
  • Each one is card and has details 
  • Card details id, language, topic, participants, owner
  • Show mic if any enabled mic on room otherwise show disabled mic
  • Use websocket to fetch rooms
  • Rooms will be shown from latest to oldest
  • Can be filtered by topic 
  • Can be filtered by language
  • Each one has title (100 characters)
  • Each room's id can be copied
  • Each room has menu button to do actions |
| User can create a new room |   • Rooms can be private and public
  • Title is not necessary but has only 100 character limit
  • Language by default is English
  • Topic by default Hobbies/Interests
  • User can select multiple topics up to 5
  • User can choose different colors for rooms 
  • By default it is gray
  • You can find list of topics on internet mostly about talks
  • Room owner by default is the one who creates it, only that person who can change ownership, if he leave the room without changing the ownership never switches to anyone unless owner does
  • Max participants are 10 and can be zero too but by default it is 10
  • User only can one room |
|  |  |