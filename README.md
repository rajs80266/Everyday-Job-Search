For open pages with applied filters

**Workday**
1. Open Network in developer tools
2. Search for "/jobs"
3. Request URL in Headers (https://......myworkdayjobs.com/wday/cxs/..../jobs) is a link
4. View Source for Payload is {"appliedFacets":{},"limit":20,"offset":0,....} is body
5. Add link and body to workdayCompanies.json in following format
   {
        "name": "COMPANY NAME",
        "link": "LINK",
        "request": {
            "body": "BODY by adding slash \ before every double quotes " for preventing error"
        }
   }
6. Run node index.js

**Eightfold**
1. Open Network in developer tools
2. Search for "/jobs?domain=nutanix.com"
3. Request URL in Headers is a link
4. Add link and body to EightFoldCompanies.json in following format
   {
        "name": "COMPANY NAME",
        "link": "LINK"
   }
5. Run node index.js

**Other Companies**
1. Open Network in developer tools
2. Search for link proving job list in preview
3. Copy it as fetch
4. Add link and body to otherCompanies.json in following format
   {
        "name": "COMPANY NAME",
        "link": "1st Parameter of fetch"
        "request: "2nd Parameter of fetch"
   }
5. Run node index.js
