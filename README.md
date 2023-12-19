For open workday pages with applied filters
1. Open Network in developer tools
2. Search for "/jobs"
3. Request URL in Headers (https://......myworkdayjobs.com/wday/cxs/..../jobs) is a link
4. View Source for Payload is {"appliedFacets":{},"limit":20,"offset":0,....} is body
5. Add link and body to workday companies.json in following format
   {
        "name": "COMPANY NAME",
        "link": "LINK",
        "request": {
            "body": "BODY by adding slash \ before every double quotes " for preventing error"
        }
   }
6. Run node index.js

For open eightfold pages with applied filters
1. Open Network in developer tools
2. Search for "/jobs?domain=nutanix.com"
3. Request URL in Headers is a link
4. Add link and body to workday companies.json in following format
   {
        "name": "COMPANY NAME",
        "link": "LINK"
   }
5. Run node index.js
