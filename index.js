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

const getOtherCompanies = () => {
    const data = fs.readFileSync('otherCompanies.json', 'utf8');
    return JSON.parse(data);
}
const companies = [
    ...getWorkdayCompanies(),
    ...getEightFoldCompanies(),
    ...getOtherCompanies()
];

const getValue = (json, path) => {
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
    try {
        for (const company of companies.splice(0)) {
            const response = await getResponse(company.link, company.request, company.name);
            const newData = getValue(response, company.path);

            const filePath = company.name + '.json';
            let jsonData = [];
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                jsonData = JSON.parse(data);
            } catch {}
            const newRoles = newData.filter(newRole => !jsonData.some(oldRole =>
                getValue(oldRole, company.identifier) === getValue(newRole, company.identifier)
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
            } else if (eightFoldCompanyNames.includes(company.name)) {
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
            } else if (company.name == "Amazon") {
                for(const newRole of newRoles) {
                    newRecords.push(
                        {
                            company: company.name,
                            role: newRole.title.replace(new RegExp(',', 'g'), '-'),
                            id: newRole.id_icims,
                            viewedAt: today.getDate() + '-' + today.getMonth() + '-' + today.getFullYear(),
                            url: "https://www.amazon.jobs" + newRole.job_path,
                            notes: "Posted Date: " + newRole.posted_date + " Basic Qualification: " + newRole.basic_qualifications,
                        }
                    )
                }
            } else if (company.name == "Meta") {
                for(const newRole of newRoles) {
                    newRecords.push(
                        {
                            company: company.name,
                            role: newRole.title.replace(new RegExp(',', 'g'), '-'),
                            id: newRole.id,
                            viewedAt: today.getDate() + '-' + today.getMonth() + '-' + today.getFullYear(),
                            url: "https://www.metacareers.com/jobs/" + newRole.id,
                            notes: "",
                        }
                    )
                }
            } else if (company.name == "Service Now") {
                for(const newRole of newRoles) {
                    newRecords.push(
                        {
                            company: company.name,
                            role: newRole.data.title.replace(new RegExp(',', 'g'), '-'),
                            id: newRole.data.req_id,
                            viewedAt: today.getDate() + '-' + today.getMonth() + '-' + today.getFullYear(),
                            url: newRole.data.apply_url,
                            notes: "Posted Date: " + newRole.data.posted_date,
                        }
                    )
                }
            } else if (company.name == "Way Fair") {
                for(const newRole of newRoles) {
                    newRecords.push(
                        {
                            company: company.name,
                            role: newRole.title.replace(new RegExp(',', 'g'), '-'),
                            id: newRole.requisitionId,
                            viewedAt: today.getDate() + '-' + today.getMonth() + '-' + today.getFullYear(),
                            url: newRole.structuredDataApplyLink,
                            notes: "Posted Date: " + newRole.createdDate,
                        }
                    )
                }
            }
            fs.writeFile(filePath, updatedJsonData, 'utf8', (err) => {
                console.log('JSON file updated successfully.');
            });
        };
    } catch(err) {
        console.log(err);
    }
    addNewRoles(newRecords);
}

run();