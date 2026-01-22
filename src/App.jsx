import React, { useState, useEffect } from 'react';
import { BarChart2, Database, Table, X, Sparkles, FileSpreadsheet, TrendingUp } from 'lucide-react';
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
  const [chartTitle, setChartTitle] = useState('');
  const [chartColor, setChartColor] = useState('multicolor');
  const [labelPosition, setLabelPosition] = useState('auto');
  const [customXAxisLabel, setCustomXAxisLabel] = useState('');
  const [customYAxisLabel, setCustomYAxisLabel] = useState('');

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
      setChartTitle('');
      setCustomXAxisLabel('');
      setCustomYAxisLabel('');

      // 优先选择日期列作为X轴
      const dateColumns = Object.keys(types).filter(col => types[col] === 'date');
      if (dateColumns.length > 0) {
        setGroupBy(dateColumns[0]);
      }

      // 选择数值列作为Y轴
      const numericColumns = Object.keys(types).filter(col => types[col] === 'number');
      if (numericColumns.length > 0) {
        setAggregateBy(numericColumns[0]);
      }

      // 如果没有日期列，选择分类列作为X轴
      if (dateColumns.length === 0) {
        const categoricalColumns = Object.keys(types).filter(col => types[col] !== 'number');
        if (categoricalColumns.length > 0) {
          setGroupBy(categoricalColumns[0]);
        }
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
    setChartTitle('');
    setCustomXAxisLabel('');
    setCustomYAxisLabel('');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                  <BarChart2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Excel 数据可视化工具
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    专业级数据分析与可视化平台
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>支持 Excel 文件</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>8+ 种图表类型</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 shadow-sm">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-bold">错误</p>
              <p className="text-red-700 mt-1">{error}</p>
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
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 opacity-20"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">正在处理文件...</p>
            <p className="text-sm text-gray-500 mt-2">解析数据并智能识别列类型</p>
          </div>
        )}

        {data.length > 0 && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <PivotTableConfig
                columns={columns}
                columnTypes={columnTypes}
                data={data}
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
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                showLegend={showLegend}
                setShowLegend={setShowLegend}
                chartTitle={chartTitle}
                setChartTitle={setChartTitle}
                chartColor={chartColor}
                setChartColor={setChartColor}
                labelPosition={labelPosition}
                setLabelPosition={setLabelPosition}
                xAxisLabel={customXAxisLabel}
                setXAxisLabel={setCustomXAxisLabel}
                yAxisLabel={customYAxisLabel}
                setYAxisLabel={setCustomYAxisLabel}
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
                chartTitle={chartTitle}
                chartColor={chartColor}
                labelPosition={labelPosition}
                customXAxisLabel={customXAxisLabel}
                customYAxisLabel={customYAxisLabel}
              />
            </div>
          </div>
        )}

        {data.length > 0 && !loading && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">数据预览</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <Database className="w-4 h-4 text-blue-600 inline mr-2" />
                  <span className="text-sm font-medium text-blue-800">共 {data.length} 条记录</span>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-green-800">{columns.length} 列</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                      >
                        {col}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          columnTypes[col] === 'date' ? 'bg-blue-100 text-blue-800' :
                          columnTypes[col] === 'number' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {columnTypes[col] === 'date' ? '📅 日期' :
                           columnTypes[col] === 'number' ? '📊 数值' : '📝 文本'}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex} className={`transition-colors ${
                      rowIndex % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'
                    }`}>
                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >
                          {row[col] !== null && row[col] !== undefined ? row[col] : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    显示前 10 条记录，共 <span className="font-bold text-gray-800">{data.length}</span> 条
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 font-medium">
              Excel 数据可视化工具 - 支持多种图表类型和数据聚合功能
            </p>
            <p className="text-sm text-gray-500 mt-2">
              使用 React + Recharts + Tailwind CSS 构建
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
