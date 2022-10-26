import React, { useEffect, useState } from "react";
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Badge } from 'primereact/badge';
import { Chart } from 'primereact/chart';
import { Dialog } from 'primereact/dialog';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import './tables.scss'
const Tables = (props) => {

    const [selectedUser, setSelectedusers] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [userData, setUserData] = useState([]);
    const [dataTableList, setDataTableList] = useState([]);
    const [coloumns, setColoumns] = useState([]);
    const [filters, setFilters] = useState([]);
    const [colors, setColors] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [lightOptions] = useState({
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            r: {
                max: 5,
                min: 0,
                ticks: {
                    stepSize: 1
                },
                pointLabels: {
                    color: '#495057',
                },
                grid: {
                    color: '#ebedef',
                },
                angleLines: {
                    color: '#ebedef'
                }
            },

        }
    });
    useEffect(() => {
        setUserData(props.tableData);
        setColoumns(props.tableColoumns);
        covertToDataTable(props.tableData);
        if (!filters.length && props.tableColoumns) { setIntialFilters() }
        if (props.chartDialog) {
            customDataForChart();
        }
        // eslint-disable-next-line 
    }, [props]);

    useEffect(() => {
        const url = "https://assistant-api.mazhr.com/client/v1/config";
        const fetchColors = async () => {
            try {
                const response = await fetch(url);
                const json = await response.json();
                setColors(json.data)
            } catch (error) {
                console.log("error", error);
                setColors([
                    { color: "#00B0A0", points_list: [1, 2, 3] },
                    { color: "#FFBB31", points_list: [4, 5, 6] },
                    { color: "#8049B0", points_list: [7, 8, 9] },
                ])
            }
        };
        if (!colors.length) {
            fetchColors();
        }// eslint-disable-next-line
    }, [colors])

    const customDataForChart = () => {
        const labels = [];
        const allCol = props.tableColoumns || [];
        allCol?.forEach((col) => {
            labels.push(col.header_name);
        });
        const dataset = [];
        let chartDataObj = {};
        let userName = "";
        if (props?.selectedCol.toLowerCase() === 'competency & attitude') {
            selectedUser.forEach((user, index) => {
                userName = user.user_name
                const keys = Object.keys(user);
                keys.forEach((key, i) => {
                    let nameLabel = '';
                    let randomColor = '';
                    let data = [];
                    if (typeof user[`${key}`] === 'object' && user[`${key}`]) {
                        nameLabel = key.toUpperCase();
                        const colKeys = Object.keys(user[`${key}`]);
                        for (let j = 0; j < colKeys.length; j++) {
                            if (typeof user[`${key}`][`${colKeys[j]}`] === 'number' && colKeys[j] !== 'user_id') {
                                data.push(user[`${key}`][`${colKeys[j]}`]);
                            }
                        }
                        randomColor = '#' + Math.floor(Math.random() * 16777215).toString(17);
                        dataset.push({ label: nameLabel, data: data, borderColor: randomColor, pointHoverBackgroundColor: '#fff', });
                    }
                });

            });
        } else {
            selectedUser.forEach((user, index) => {
                let data = [];
                let randomColor = '';
                const nameLabel = user.user_name;
                const keys = Object.keys(user);

                keys.forEach((key, i) => {
                    if (typeof user[`${key}`] === 'object' && key === props?.selectedCol.toLowerCase()) {
                        const colKeys = Object.keys(user[`${key}`]);
                        for (let j = 0; j < colKeys.length; j++) {
                            if (typeof user[`${key}`][`${colKeys[j]}`] === 'number' && colKeys[j] !== 'user_id') {
                                data.push(user[`${key}`][`${colKeys[j]}`]);
                            }
                        }
                    }
                });
                randomColor = '#' + Math.floor(Math.random() * 16777215).toString(17);
                dataset.push({ label: nameLabel, data: data, borderColor: randomColor, pointHoverBackgroundColor: '#fff', });
            });
        }
        chartDataObj = ({ userName: userName, labels: labels, datasets: dataset });
        setChartData(chartDataObj);
    }

    const covertToDataTable = (data) => {
        const dataTableData = [];
        data && data.forEach((val) => {
            if (typeof val === 'object' && !val.user_id) {
                val['isSelected'] = false;
                dataTableData.push(val);
            } else {
                const valKeys = Object.keys(val);
                valKeys.forEach((key, i, arr) => {
                    if (typeof val[`${key}`] === 'object' && key !== 'image') {
                        val[`${key}`]['isSelected'] = false;
                        if (!val[`${key}`]['user_id']) {
                            val[`${key}`]['user_id'] = val.user_id;
                        } if (!val[`${key}`]['user_name']) {
                            val[`${key}`]['user_name'] = val.user_name;
                        }
                        dataTableData.push(val[`${key}`]);
                    }
                });
            }
        });
        setDataTableList(dataTableData)
    }

    const setIntialFilters = () => {
        const allCol = props.tableColoumns;
        let obj = {};
        allCol && allCol?.forEach((col) => {
            obj[`${col.column_name}`] = { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] };
        });
        setFilters(obj)
    }

    const headerTemplate = (data) => {
        return (
            <div>
                <label className="custom-checkbox" tab-index="0" aria-label="Checkbox Label">
                    <input type="checkbox" defaultChecked={data.isSelected} onChange={e => onSlection(e, data, !data.isSelected)} />
                    <span className="checkmark"></span>
                </label>
                <span className="image-text">{data.user_name}</span>
            </div>
        );
    }
    const onSlection = (e, data) => {
        data.isSelected = e.target.checked;
        if (data.isSelected) {
            userData.forEach((listVal) => {
                if (listVal.user_id === data.user_id) {
                    setSelectedusers([...selectedUser, listVal]);
                    props.selectedRow([...selectedUser, listVal]);
                }
            });
        } else {
            onUnselect(data);
        }
    }

    const onUnselect = (data) => {
        let selectedRows = [...selectedUser];
        if (selectedRows.length > 0) {
            const index = selectedRows.findIndex(val => val.user_id === data.user_id);
            selectedRows.splice(index, 1);
            setSelectedusers([...selectedRows]);
            if (!selectedRows.length) {
                props.selectedRow(null);
            } else {
                props.selectedRow([...selectedRows]);
            }
        }
    }

    const ColBodyTemplate = (data) => {
        return (
            <span>{data.name}</span>
        );
    }
    const pointTemplate = (rowData, column) => {
        const field = column.field;
        let clr = '';
        colors && colors?.forEach((val) => {
            if (val.points_list.includes(rowData[`${field}`])) {
                clr = val.color;
            }
        });
        return <Badge value={rowData[`${field}`]} size="large" severity="success" style={{ background: `${clr}`, color: 'white' }}  ></Badge>
    }
    return (
        <div className="card">
            <DataTable value={dataTableList} rowGroupMode="subheader" groupRowsBy="user_id" showGridlines
                sortMode="single" sortField="representative.user_name" sortOrder={1} responsiveLayout="scroll"
                rowGroupHeaderTemplate={headerTemplate} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                filterDisplay="menu" rows={20} paginator filters={filters} >

                <Column field="name" header="Name" body={ColBodyTemplate}></Column>
                {coloumns && coloumns.map((column, index) => {
                    return <Column key={index} field={column.column_name} header={column.header_name} filter dataType="numeric" body={pointTemplate} ></Column>
                })}

            </DataTable>
            <Dialog visible={props.chartDialog} style={{ width: '55%' }} header=" Sales Report" modal className="p-fluid" onHide={() => props.onChartHide()}>
                <div className="card flex justify-content-center">
                    <h4>{chartData.userName}</h4>
                    <Chart type="radar" data={chartData} options={lightOptions} style={{ position: 'relative', width: '70%' }} />
                </div>
            </Dialog>
        </div>

    );
}

export default Tables;