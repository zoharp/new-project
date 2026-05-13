# Project overview
I need to build a performance/ stability tool for the Orcanos system

# How it works
1. I have a list of URLs since its single tenant
2. The app will use a Json file that wil contian a list of all accoutns. it will go one by one and perform the scenario
2.1. JSON file structure:
- Account name
- URL - URL format: either https://app.orcanos.com/ACCOUNT/web or https://us.orcanos.com/ACCOUNT/web
- Pwd - encrypted. 
- Indications (general to all)- how many seconds for warning (yellow), how many seconds for falure (red)
3. I will provide A table with al info and you will use the table to create the Json file with encrypted pwd

# How to build the scenario
- I will simulate a test with one accpoount so we can record the steps and creaqte the scenario
- Then the app will use the recorded scenario and run the simulaiton on all URL's in the Json file
- There is a single user - orcanos.tech for all accounts

# App features
- Login screen - with one admin password for now
- Main screen - shows list of accoutns and last data (custoemrs in Json file)
- Run test button - will execute the test sceario
- What to record: Each step wil lahve a name. system will show start time, end time, total seconds. If > 3 seconds - yellow. If > 10 seconds - Red
- Show dashbaord of each step average, list accounts with problems (> 10), average for entire scenario. Show bar also based on hsitory of the scenario where X axis is the day/week/month (depending on how many recrdings we have)
- History - all runs saved to sqlite for now. History buttn will show last runs and i can select oe run and see reuslts

# Architecture
- App is hosted online with the Json file - preferred Vercel