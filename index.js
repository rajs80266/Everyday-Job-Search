const fs = require('fs');

const getResponse = async (link, request, name) => {
    const output = await fetch(link, request);
    console.log("Fetch Successful for", name);
    return output.json();
};

const getWorkdayCompanies = () => {
    const wordDayCompanies = [];
    const data = fs.readFileSync('workdayCompanies.json', 'utf8');
    jsonData = JSON.parse(data);
    jsonData.forEach(company => {
        wordDayCompanies.push({
            ...company,
            request: {
                "headers": {"content-type": "application/json"},
                "body": company.request.body,
                "method": "POST"
            },
            path: "jobPostings",
            identifier: "bulletFields.0"
        });
    });
    return wordDayCompanies;
}

const companies = getWorkdayCompanies();

const getId = (json, path) => {
    let result = json;
    for (const key of path.split('.')) {
        result = result && result[key];
    }
    return result;
};

const newRecords = []
const addNewRoles = (newRows) => {
    csvPath = 'All_Roles.csv';
    let csvRows = [];
    fs.readFile(csvPath, 'utf8', (err, data) => {
        if (!err) {
            csvRows = data.split('\n').map(row => row.split(','));
        }

        newRows.forEach(newRow => {
            const newRowArray = Object.values(newRow);
            csvRows.unshift(newRowArray);
        });

        const updatedCSV = csvRows.map(row => row.join(',')).join('\n');

        fs.writeFile(csvPath, updatedCSV, 'utf8', (err) => {
              console.log('Rows added successfully!');
        });
    });
};

const run = async () => {
    for (const company of companies) {
        const response = await getResponse(company.link, company.request, company.name);
        const newData = response[company.path];

        const filePath = company.name + '.json';
        let jsonData = [];
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            jsonData = JSON.parse(data);
        } catch {}
        const newRoles = newData.filter(newRole => !jsonData.some(oldRole =>
            getId(oldRole, company.identifier) === getId(newRole, company.identifier)
        ));
        console.log(newRoles);
        const today = new Date();
        const updatedJson = [...jsonData, ...newRoles];
        const updatedJsonData = JSON.stringify(updatedJson);
        // if (['Henryschein', 'SalesForce', 'NVidia'].includes(company.name)) {
        if (true) {
            for(const newRole of newRoles) {
                newRecords.push(
                    {
                        company: company.name,
                        role: newRole.title.replace(new RegExp(',', 'g'), '-'),
                        id: newRole.bulletFields[0],
                        viewedAt: today.getDate() + '-' + today.getMonth(),
                        notes: newRole.postedOn
                    }
                )
            }
        }
        fs.writeFile(filePath, updatedJsonData, 'utf8', (err) => {
            console.log('JSON file updated successfully.');
        });
    };

    addNewRoles(newRecords);
}

run();