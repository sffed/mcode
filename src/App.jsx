import React, { useState, useEffect } from 'react';
import { BarChart2, Database, Table, X } from 'lucide-react';
import FileUpload from './components/FileUpload';
import PivotTableConfig from './components/PivotTableConfig';
import ChartDisplay from './components/ChartDisplay';
import { parseExcel, detectColumnType, groupAndAggregate, aggregateByDate } from './utils/excelUtils';

function App() {
  const [fileName, setFileName] = useState('');
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [groupBy, setGroupBy] = useState('');
  const [aggregateBy, setAggregateBy] = useState('');
  const [aggregateFunc, setAggregateFunc] = useState('sum');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState([]);
  const [xAxisTitle, setXAxisTitle] = useState('分组');
  const [yAxisTitle, setYAxisTitle] = useState('数值');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [timeGroup, setTimeGroup] = useState('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError('');

    try {
      const result = await parseExcel(file);
      setFileName(file.name);
      setData(result.data);
      setColumns(result.columns);

      const types = {};
      result.columns.forEach(col => {
        types[col] = detectColumnType(col, result.data);
      });
      setColumnTypes(types);

      setGroupBy('');
      setAggregateBy('');
      setChartData([]);

      const numericColumns = Object.keys(types).filter(col => types[col] === 'number');
      if (numericColumns.length > 0) {
        setAggregateBy(numericColumns[0]);
      }

      const categoricalColumns = Object.keys(types).filter(col => types[col] !== 'number');
      if (categoricalColumns.length > 0) {
        setGroupBy(categoricalColumns[0]);
      }
    } catch (err) {
      setError('文件解析失败，请确保上传的是有效的Excel文件');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFile = () => {
    setFileName('');
    setData([]);
    setColumns([]);
    setColumnTypes({});
    setGroupBy('');
    setAggregateBy('');
    setChartData([]);
    setError('');
  };

  useEffect(() => {
    if (groupBy && aggregateBy && data.length > 0) {
      try {
        let aggregatedData;
        if (columnTypes[groupBy] === 'date') {
          aggregatedData = aggregateByDate(data, groupBy, aggregateBy, aggregateFunc, timeGroup);
        } else {
          aggregatedData = groupAndAggregate(data, groupBy, aggregateBy, aggregateFunc);
        }
        setChartData(aggregatedData);

        if (groupBy) {
          setXAxisTitle(groupBy);
        }
        if (aggregateBy) {
          setYAxisTitle(`${aggregateBy} (${aggregateFunc})`);
        }
      } catch (err) {
        console.error('数据聚合失败:', err);
        setError('数据处理失败，请检查配置');
      }
    } else {
      setChartData([]);
    }
  }, [groupBy, aggregateBy, aggregateFunc, data, columnTypes, timeGroup]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Excel 数据可视化工具</h1>
          </div>
          <p className="text-gray-600 mt-2">上传Excel文件，自定义透视表配置，生成精美图表</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">错误</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <FileUpload
            onFileUpload={handleFileUpload}
            fileName={fileName}
            onClear={handleClearFile}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">正在处理文件...</p>
          </div>
        )}

        {data.length > 0 && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <PivotTableConfig
                columns={columns}
                columnTypes={columnTypes}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
                aggregateBy={aggregateBy}
                setAggregateBy={setAggregateBy}
                aggregateFunc={aggregateFunc}
                setAggregateFunc={setAggregateFunc}
                chartType={chartType}
                setChartType={setChartType}
                timeGroup={timeGroup}
                setTimeGroup={setTimeGroup}
              />
            </div>

            <div className="lg:col-span-9">
              <ChartDisplay
                data={chartData}
                chartType={chartType}
                groupBy={groupBy}
                aggregateBy={aggregateBy}
                xAxisTitle={xAxisTitle}
                yAxisTitle={yAxisTitle}
                showGrid={showGrid}
                showLegend={showLegend}
              />
            </div>
          </div>
        )}

        {data.length > 0 && !loading && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">数据预览</h2>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">共 {data.length} 条记录</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                        <span className="ml-1 text-xs text-gray-400">
                          ({columnTypes[col]})
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {row[col] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  只显示前 10 条记录，共 {data.length} 条
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>Excel 数据可视化工具 - 支持多种图表类型和数据聚合功能</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
