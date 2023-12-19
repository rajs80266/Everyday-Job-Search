const fs = require('fs');

const workdayCompanyNames = [];
const eightFoldCompanyNames = [];

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
        workdayCompanyNames.push(company.name);
    });
    return wordDayCompanies;
}

const getEightFoldCompanies = () => {
    const eightFoldCompanies = [];
    const data = fs.readFileSync('EightFoldCompanies.json', 'utf8');
    jsonData = JSON.parse(data);
    jsonData.forEach(company => {
        eightFoldCompanies.push({
            ...company,
            request: {
                "headers": {"content-type": "application/json"},
                "method": "GET"
            },
            path: "positions",
            identifier: "id"
        });
        eightFoldCompanyNames.push(company.name);
    });
    return eightFoldCompanies;
}

const companies = [...getWorkdayCompanies(), ...getEightFoldCompanies()];

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
        if (workdayCompanyNames.includes(company.name)) {
            for(const newRole of newRoles) {
                newRecords.push(
                    {
                        company: company.name,
                        role: newRole.title.replace(new RegExp(',', 'g'), '-'),
                        id: newRole.bulletFields[0],
                        viewedAt: today.getDate() + '-' + today.getMonth() + '-' + today.getFullYear(),
                        url: '-',
                        notes: newRole.postedOn,
                    }
                )
            }
        }
        if (eightFoldCompanyNames.includes(company.name)) {
            for(const newRole of newRoles) {
                newRecords.push(
                    {
                        company: company.name,
                        role: newRole.name.replace(new RegExp(',', 'g'), '-'),
                        id: newRole.id,
                        viewedAt: today.getDate() + '-' + today.getMonth() + '-' + today.getFullYear(),
                        url: newRole.canonicalPositionUrl,
                        notes: newRole.job_description,
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