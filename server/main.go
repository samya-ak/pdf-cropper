package main

import (
	"fmt"
	"net/http"

	"github.com/samya-ak/pdf-cropper/server/crop"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /crop", crop.Crop)

	url := "localhost:8000"
	fmt.Printf("listening at %s ...", url)
	http.ListenAndServe(url, mux)
}
