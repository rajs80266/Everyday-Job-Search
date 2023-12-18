For open workday pages with applied filters
1. Open Network in developer tools
2. Search for "/jobs"
3. Request URL in Headers (https://......myworkdayjobs.com/wday/cxs/..../jobs) is a link
4. View Source for Payload is {"appliedFacets":{},"limit":20,"offset":0,....} is request.body
5. Add link and request.body to workday companies.json
6. Run node index.js
   
