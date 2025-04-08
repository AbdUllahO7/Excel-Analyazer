"use client"

import { useState } from "react"
import { Globe, Database, Lock, AlertCircle, RefreshCw, Code } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ApiConnectorProps {
  onDataFetched: (data: any[], columns: string[], sourceName: string) => void
}

export function ApiConnector({ onDataFetched }: ApiConnectorProps) {
  const [apiSource, setApiSource] = useState("custom")
  const [apiUrl, setApiUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [authType, setAuthType] = useState("none")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [bearerToken, setBearerToken] = useState("")
  const [headers, setHeaders] = useState("")
  const [queryParams, setQueryParams] = useState("")
  const [requestMethod, setRequestMethod] = useState("GET")
  const [requestBody, setRequestBody] = useState("")
  const [responseFormat, setResponseFormat] = useState("json")
  const [jsonPath, setJsonPath] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [fetchProgress, setFetchProgress] = useState(0)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [previewColumns, setPreviewColumns] = useState<string[]>([])

  const predefinedApis = [
    { id: "custom", name: "Custom API", url: "", authType: "none" },
    { id: "github", name: "GitHub API", url: "https://api.github.com/repos/{owner}/{repo}/issues", authType: "bearer" },
    {
      id: "weather",
      name: "OpenWeather API",
      url: "https://api.openweathermap.org/data/2.5/weather",
      authType: "apikey",
    },
    { id: "covid", name: "COVID-19 Data", url: "https://disease.sh/v3/covid-19/countries", authType: "none" },
    { id: "stocks", name: "Alpha Vantage (Stocks)", url: "https://www.alphavantage.co/query", authType: "apikey" },
    { id: "news", name: "News API", url: "https://newsapi.org/v2/top-headlines", authType: "apikey" },
  ]

  const handleApiSourceChange = (value: string) => {
    setApiSource(value)
    const selectedApi = predefinedApis.find((api) => api.id === value)
    if (selectedApi) {
      setApiUrl(selectedApi.url)
      setAuthType(selectedApi.authType)

      // Reset other fields
      setApiKey("")
      setUsername("")
      setPassword("")
      setBearerToken("")
      setHeaders("")
      setQueryParams("")
      setRequestBody("")

      // Set default values based on API
      if (value === "github") {
        setJsonPath("$")
        setQueryParams("state=open")
      } else if (value === "weather") {
        setJsonPath("$")
        setQueryParams("q=London&units=metric")
      } else if (value === "covid") {
        setJsonPath("$")
      } else if (value === "stocks") {
        setJsonPath("$.['Time Series (Daily)']")
        setQueryParams("function=TIME_SERIES_DAILY&symbol=IBM&outputsize=compact")
      } else if (value === "news") {
        setJsonPath("$.articles")
        setQueryParams("country=us&category=business")
      }
    }
  }

  const handleTestConnection = () => {
    setIsFetching(true)
    setFetchProgress(0)
    setFetchError(null)
    setPreviewData(null)
    setPreviewColumns([])

    // Simulate API request
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5
      if (progress >= 100) {
        clearInterval(interval)
        progress = 100

        try {
          // Generate mock data based on the selected API
          const { mockData, mockColumns } = generateMockData(apiSource)

          setPreviewData(mockData.slice(0, 5)) // Show only first 5 rows in preview
          setPreviewColumns(mockColumns)

          toast({
            title: "Connection successful",
            description: `Retrieved ${mockData.length} records from the API`,
          })
        } catch (error) {
          setFetchError("Failed to parse API response. Please check your settings and try again.")
        }

        setIsFetching(false)
      }
      setFetchProgress(progress)
    }, 300)
  }

  const handleFetchData = () => {
    setIsFetching(true)
    setFetchProgress(0)

    // Simulate API request
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5
      if (progress >= 100) {
        clearInterval(interval)
        progress = 100

        try {
          // Generate mock data based on the selected API
          const { mockData, mockColumns } = generateMockData(apiSource)

          // Pass data to parent component
          onDataFetched(
            mockData,
            mockColumns,
            apiSource === "custom"
              ? "API Data"
              : predefinedApis.find((api) => api.id === apiSource)?.name || "API Data",
          )

          toast({
            title: "Data fetched successfully",
            description: `Loaded ${mockData.length} records from the API`,
          })
        } catch (error) {
          setFetchError("Failed to fetch data from API. Please check your settings and try again.")
        }

        setIsFetching(false)
      }
      setFetchProgress(progress)
    }, 300)
  }

  const generateMockData = (source: string) => {
    let mockData: any[] = []
    let mockColumns: string[] = []

    switch (source) {
      case "github":
        mockData = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          number: i + 101,
          title: `Fix bug in ${["login", "dashboard", "settings", "profile"][i % 4]} component`,
          state: i % 5 === 0 ? "closed" : "open",
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
          updated_at: new Date(Date.now() - i * 43200000).toISOString(),
          user: {
            login: `user${(i % 5) + 1}`,
            avatar_url: `https://example.com/avatar${(i % 5) + 1}.jpg`,
          },
          comments: Math.floor(Math.random() * 10),
          body: `This is a sample issue description for issue #${i + 101}.`,
        }))
        mockColumns = ["id", "number", "title", "state", "created_at", "updated_at", "user.login", "comments", "body"]
        break

      case "weather":
        mockData = [
          {
            name: "London",
            main: {
              temp: 15.2,
              feels_like: 14.8,
              temp_min: 13.9,
              temp_max: 16.7,
              pressure: 1012,
              humidity: 76,
            },
            weather: [
              {
                id: 801,
                main: "Clouds",
                description: "few clouds",
                icon: "02d",
              },
            ],
            wind: {
              speed: 4.1,
              deg: 250,
            },
            clouds: {
              all: 20,
            },
            dt: Date.now() / 1000,
            sys: {
              country: "GB",
              sunrise: Date.now() / 1000 - 25000,
              sunset: Date.now() / 1000 + 25000,
            },
            timezone: 3600,
            id: 2643743,
            cod: 200,
          },
        ]
        mockColumns = [
          "name",
          "main.temp",
          "main.feels_like",
          "main.humidity",
          "weather.0.main",
          "weather.0.description",
          "wind.speed",
          "sys.country",
        ]
        break

      case "covid":
        mockData = Array.from({ length: 15 }, (_, i) => ({
          country: [
            "USA",
            "India",
            "Brazil",
            "UK",
            "Russia",
            "France",
            "Germany",
            "Italy",
            "Spain",
            "Mexico",
            "Canada",
            "Japan",
            "Australia",
            "China",
            "South Korea",
          ][i],
          countryInfo: {
            _id: i,
            flag: `https://example.com/flags/${i}.png`,
          },
          cases: 1000000 + Math.floor(Math.random() * 9000000),
          todayCases: Math.floor(Math.random() * 10000),
          deaths: 10000 + Math.floor(Math.random() * 90000),
          todayDeaths: Math.floor(Math.random() * 1000),
          recovered: 900000 + Math.floor(Math.random() * 8000000),
          active: 50000 + Math.floor(Math.random() * 450000),
          critical: 1000 + Math.floor(Math.random() * 9000),
          tests: 10000000 + Math.floor(Math.random() * 90000000),
          population: 10000000 + Math.floor(Math.random() * 990000000),
        }))
        mockColumns = [
          "country",
          "cases",
          "todayCases",
          "deaths",
          "todayDeaths",
          "recovered",
          "active",
          "critical",
          "tests",
          "population",
        ]
        break

      case "stocks":
        const dates = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split("T")[0]
        })

        mockData = dates.map((date) => {
          const basePrice = 150 + Math.random() * 20
          return {
            date,
            open: basePrice - 2 + Math.random() * 4,
            high: basePrice + 1 + Math.random() * 3,
            low: basePrice - 3 - Math.random() * 2,
            close: basePrice - 1 + Math.random() * 2,
            volume: Math.floor(1000000 + Math.random() * 5000000),
          }
        })
        mockColumns = ["date", "open", "high", "low", "close", "volume"]
        break

      case "news":
        mockData = Array.from({ length: 10 }, (_, i) => ({
          source: {
            id: `source-${i}`,
            name: [
              "CNN",
              "BBC",
              "Reuters",
              "Bloomberg",
              "CNBC",
              "WSJ",
              "NYT",
              "The Guardian",
              "Financial Times",
              "The Economist",
            ][i],
          },
          author: `Author ${i + 1}`,
          title: `News headline ${i + 1} about ${["business", "technology", "politics", "health", "science"][i % 5]}`,
          description: `This is a sample news description for article #${i + 1}.`,
          url: `https://example.com/news/${i + 1}`,
          urlToImage: `https://example.com/images/news${i + 1}.jpg`,
          publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
          content: `Full content of news article #${i + 1}. This would typically be much longer.`,
        }))
        mockColumns = ["source.name", "author", "title", "description", "publishedAt", "url"]
        break

      default: // custom or any other
        mockData = Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          name: `Item ${i + 1}`,
          category: ["Electronics", "Clothing", "Food", "Books", "Home"][i % 5],
          price: Math.round((10 + Math.random() * 90) * 100) / 100,
          inStock: Math.random() > 0.3,
          rating: Math.round((1 + Math.random() * 4) * 10) / 10,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        }))
        mockColumns = ["id", "name", "category", "price", "inStock", "rating", "createdAt"]
    }

    return { mockData, mockColumns }
  }

  const parseHeadersOrParams = (text: string) => {
    if (!text.trim()) return {}

    try {
      // Try to parse as JSON
      return JSON.parse(text)
    } catch (e) {
      // Parse as key-value pairs
      const result: Record<string, string> = {}
      text.split("\n").forEach((line) => {
        const [key, value] = line.split(":").map((part) => part.trim())
        if (key && value) {
          result[key] = value
        }
      })
      return result
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>API Connect</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>API Connector</DialogTitle>
            <DialogDescription>
              Connect to external APIs to fetch data for analysis. Import data from various web services and APIs.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="connection" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connection" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Connection</span>
              </TabsTrigger>
              <TabsTrigger value="authentication" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Authentication</span>
              </TabsTrigger>
              <TabsTrigger value="request" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span>Request</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-source">API Source</Label>
                  <Select value={apiSource} onValueChange={handleApiSourceChange}>
                    <SelectTrigger id="api-source">
                      <SelectValue placeholder="Select API source" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedApis.map((api) => (
                        <SelectItem key={api.id} value={api.id}>
                          {api.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-url">API URL</Label>
                  <Input
                    id="api-url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                  />
                  <p className="text-xs text-muted-foreground">
                    {apiSource !== "custom" && "You can customize the URL for this predefined API."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response-format">Response Format</Label>
                  <Select value={responseFormat} onValueChange={setResponseFormat}>
                    <SelectTrigger id="response-format">
                      <SelectValue placeholder="Select response format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {responseFormat === "json" && (
                  <div className="space-y-2">
                    <Label htmlFor="json-path">JSON Path (Optional)</Label>
                    <Input
                      id="json-path"
                      value={jsonPath}
                      onChange={(e) => setJsonPath(e.target.value)}
                      placeholder="$.data.items"
                    />
                    <p className="text-xs text-muted-foreground">
                      Specify the path to the array of data in the JSON response (e.g., $.data.items)
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-type">Authentication Type</Label>
                  <Select value={authType} onValueChange={setAuthType}>
                    <SelectTrigger id="auth-type">
                      <SelectValue placeholder="Select authentication type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Authentication</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="apikey">API Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {authType === "basic" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                      />
                    </div>
                  </>
                )}

                {authType === "bearer" && (
                  <div className="space-y-2">
                    <Label htmlFor="bearer-token">Bearer Token</Label>
                    <Input
                      id="bearer-token"
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      placeholder="Bearer token"
                    />
                  </div>
                )}

                {authType === "apikey" && (
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="API key"
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox id="header-param" defaultChecked />
                      <Label htmlFor="header-param" className="text-sm">
                        Send as query parameter (uncheck to send as header)
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="request" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="request-method">Request Method</Label>
                  <Select value={requestMethod} onValueChange={setRequestMethod}>
                    <SelectTrigger id="request-method">
                      <SelectValue placeholder="Select request method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headers">Headers (Optional)</Label>
                  <Textarea
                    id="headers"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    placeholder="Content-Type: application/json
Accept: application/json"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Enter headers as key-value pairs, one per line</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="query-params">Query Parameters (Optional)</Label>
                  <Textarea
                    id="query-params"
                    value={queryParams}
                    onChange={(e) => setQueryParams(e.target.value)}
                    placeholder="param1=value1
param2=value2"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter query parameters as key-value pairs, one per line
                  </p>
                </div>

                {(requestMethod === "POST" || requestMethod === "PUT") && (
                  <div className="space-y-2">
                    <Label htmlFor="request-body">Request Body</Label>
                    <Textarea
                      id="request-body"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder={`{
  "key": "value"
}`}
                      className="font-mono text-sm min-h-[100px]"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {isFetching && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Fetching data...</span>
                <span>{Math.round(fetchProgress)}%</span>
              </div>
              <Progress value={fetchProgress} />
            </div>
          )}

          {fetchError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}

          {previewData && previewData.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Data Preview</h3>
              <div className="border rounded-md overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      {previewColumns.slice(0, 5).map((column) => (
                        <th key={column} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          {column}
                        </th>
                      ))}
                      {previewColumns.length > 5 && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          +{previewColumns.length - 5} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {previewColumns.slice(0, 5).map((column) => {
                          const value = column.includes(".")
                            ? column
                                .split(".")
                                .reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), row)
                            : row[column]
                          return (
                            <td key={column} className="px-3 py-2 text-sm">
                              {value === null || value === undefined
                                ? "-"
                                : typeof value === "object"
                                  ? JSON.stringify(value).substring(0, 30) +
                                    (JSON.stringify(value).length > 30 ? "..." : "")
                                  : String(value).substring(0, 30) + (String(value).length > 30 ? "..." : "")}
                            </td>
                          )
                        })}
                        {previewColumns.length > 5 && <td className="px-3 py-2 text-sm text-muted-foreground">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Showing {previewData.length} rows and {Math.min(previewColumns.length, 5)} of {previewColumns.length}{" "}
                columns
              </p>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleTestConnection} disabled={isFetching || !apiUrl}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection
            </Button>
            <Button onClick={handleFetchData} disabled={isFetching || !apiUrl || !previewData}>
              <Database className="mr-2 h-4 w-4" />
              Fetch Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
