class ZOHO_CRM_GET_RECORD {
    constructor(data, sortOrder = "asc", pageNumber = 1) {
        this.data = data
        this.sortOrder = sortOrder
        this.pageNumber = pageNumber
    }

    async getLeadSource() {
        try {
            const response = await ZOHO.CRM.API.getAllRecords({ Entity: this.data, sort_order: this.sortOrder, page: this.pageNumber })
            return await leadSource(response).then(val => { return { lead_source: val.leadSource, totalValueUnderTheSpecificDate: val.totalValueUnderTheSpecificDate } })
        } catch (err) {
            console.log(err.message)
        }
    }

    async getContactSource() {
        try {
            const responce = await ZOHO.CRM.API.getAllRecords({ Entity: this.data, sort_order: "asc", page: 1 }) // Lead convertion ratting
            return await leadConvertionRate(responce).then(val => { return val.filteredValue })
        } catch (err) {
            console.log(err.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
        const leadSourceData = await new ZOHO_CRM_GET_RECORD("Leads").getLeadSource()
        const leadConverstionRate = await new ZOHO_CRM_GET_RECORD('Contacts').getContactSource()

        await barChart(leadSourceData, leadConverstionRate)
        await convertiondatas(leadSourceData, leadConverstionRate)
    });
    ZOHO.embeddedApp.init();
});


// utils
const leadSource = async (value, subtractDate = 30) => {
    let leadSource = {}
    let totalValueUnderTheSpecificDate = []

    const todayToSubtractDate = new Date()
    todayToSubtractDate?.setDate(todayToSubtractDate.getDate() - subtractDate)

    let destructureData = value?.data

    destructureData.forEach(fetchedValue => {
        (fetchedValue?.Created_Time >= todayToSubtractDate?.toISOString() && totalValueUnderTheSpecificDate.push(fetchedValue))
        fetchedValue?.Data_Source !== "Manual" && (leadSource[fetchedValue?.Data_Source] = (leadSource[fetchedValue?.Data_Source] || 0) + 1)
    })
    return { leadSource, totalValueUnderTheSpecificDate }
}

const leadConvertionRate = async (value, subtractDate = 30) => {
    let filteredValue = []

    const todayToSubtractDate = new Date()
    todayToSubtractDate.setDate(todayToSubtractDate.getDate() - subtractDate)

    let destructureData = value?.data
    destructureData.forEach(fetchedValue => {
        fetchedValue?.Created_Time >= todayToSubtractDate?.toISOString() && fetchedValue?.Data_Source !== "Manual" && filteredValue?.push(fetchedValue)
    })
    return { filteredValue }
}

function barChart(sourceData) {

    let sourceComingFrom = []
    let sourceCount = []

    let sourceDestructure = sourceData?.lead_source
    for (const sourceValue in sourceDestructure) {
        sourceComingFrom.push(sourceValue)
        sourceCount.push(sourceDestructure[sourceValue])
    }

    const labels = sourceComingFrom;
    const data = {
        labels: labels,
        datasets: [{
            label: 'Lead Source',
            data: sourceCount,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }]
    }
    const ctx = document.getElementById("myBarChart").getContext("2d");
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    })
}


function convertiondatas(source, convertionData) {

    const convertion = document.querySelector('.convertionh3')
    convertion.textContent = convertionData?.length

    const leadCounth3 = document.querySelector('.leadCounth3')
    leadCounth3.textContent = source?.totalValueUnderTheSpecificDate?.length
}