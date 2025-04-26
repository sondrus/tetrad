package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// OllamaRequest - структура для запроса к серверу AI
type OllamaRequest struct {
	Model    string `json:"model"`
	Messages []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
	Stream      bool    `json:"stream"`
	Temperature float64 `json:"temperature"`
}

// OllamaResponse - структура для ответа от сервера AI
type OllamaResponse struct {
	ID                string `json:"id"`
	Object            string `json:"object"`
	Created           int64  `json:"created"`
	Model             string `json:"model"`
	SystemFingerprint string `json:"system_fingerprint"`
	Choices           []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

var (
	dirPath          string
	serverAddr       string
	apiKey           string
	aiModel          string
	systemPromptFile string
	systemPrompt     string
	temperature      float64
)

func init() {
	flag.StringVar(&dirPath, "dir", "../../frontend/src/locales", "Directory with JSON files")
	flag.StringVar(&serverAddr, "server", "http://localhost:11434/v1/chat/completions", "AI server address")
	flag.StringVar(&apiKey, "apikey", "", "API key (optional)")
	flag.StringVar(&aiModel, "model", "llama3.1:8b", "AI model")
	flag.Float64Var(&temperature, "temperature", 0.2, "AI generate temperature")
	flag.StringVar(&systemPromptFile, "prompt", "./prompt.txt", "System prompt file path (optional)")
}

func main() {
	flag.Parse()

	if dirPath == "" {
		fmt.Println("Directory path is required")
		os.Exit(1)
	}

	if aiModel == "" {
		fmt.Println("AI model is required")
		os.Exit(1)
	}

	if systemPromptFile != "" {
		data, err := ioutil.ReadFile(systemPromptFile)
		if err != nil {
			panic(err)
		}
		systemPrompt = string(data)
	}

	enData := loadJSON(filepath.Join(dirPath, "english.json"))

	files, err := ioutil.ReadDir(dirPath)
	if err != nil {
		panic(err)
	}

	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".json") && file.Name() != "en.json" {
			processLanguageFile(dirPath, file.Name(), enData)
		}
	}
}

func loadJSON(path string) map[string]string {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		panic(err)
	}

	var result map[string]string
	if err := json.Unmarshal(data, &result); err != nil {
		panic(err)
	}
	return result
}

func processLanguageFile(dirPath, fileName string, enData map[string]string) {
	filePath := filepath.Join(dirPath, fileName)
	langData := loadJSON(filePath)
	lang := strings.Title(strings.TrimSuffix(strings.ToLower(fileName), ".json"))

	fmt.Println("[", strings.ToUpper(lang), "]")

	missing := make(map[string]string)
	for key, enValue := range enData {
		if _, ok := langData[key]; !ok {
			missing[key] = enValue
		}
	}

	if len(missing) == 0 {
		fmt.Printf("No missing keys in %s\n", fileName)
		return
	}

	// Translate missing phrases one by one
	for key, value := range missing {
		translatedValue := translatePhrase(value, lang)
		fmt.Println(value, "=>", translatedValue)
		langData[key] = translatedValue
	}

	fmt.Println("")

	// Reorder according to en.json and add blank lines between namespaces
	keys := make([]string, 0, len(enData))
	for key := range enData {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	var builder strings.Builder
	builder.WriteString("{\n")

	var prevNamespace string
	for i, key := range keys {
		if val, exists := langData[key]; exists {
			namespace := strings.SplitN(key, ".", 2)[0]
			if prevNamespace != "" && namespace != prevNamespace {
				builder.WriteString("\n")
			}
			line := fmt.Sprintf("\t\"%s\": \"%s\"", key, escapeString(val))
			builder.WriteString(line)
			if i < len(keys)-1 {
				builder.WriteString(",\n")
			} else {
				builder.WriteString("\n")
			}
			prevNamespace = namespace
		}
	}

	builder.WriteString("}\n")

	err := ioutil.WriteFile(filePath, []byte(builder.String()), 0644)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Updated %s\n", fileName)
}

func escapeString(s string) string {
	escaped, _ := json.Marshal(s)
	return string(escaped[1 : len(escaped)-1]) // remove quotes
}

func translatePhrase(phrase string, language string) string {
	messages := []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}{
		{Role: "system", Content: strings.ReplaceAll(systemPrompt, "{Language}", language)},
		{Role: "user", Content: fmt.Sprintf("Translate the following text from English to %s:\n%s", language, phrase)},
	}

	requestBody := OllamaRequest{
		Model:       aiModel,
		Messages:    messages,
		Stream:      false,
		Temperature: temperature,
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		panic(err)
	}

	req, err := http.NewRequest("POST", serverAddr, bytes.NewReader(body))
	if err != nil {
		panic(err)
	}
	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}

	// Печать полного запроса для отладки
	// dump, err := httputil.DumpRequestOut(req, true)
	// if err != nil {
	// 	panic(err)
	// }
	// fmt.Println(string(dump))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	// Парсинг ответа от сервера
	var ollamaResp OllamaResponse
	if err := json.Unmarshal(respBody, &ollamaResp); err != nil {
		panic(err)
	}

	// Извлечение перевода из content в первом сообщении в choices
	if len(ollamaResp.Choices) > 0 {
		return ollamaResp.Choices[0].Message.Content
	}

	return ""
}
