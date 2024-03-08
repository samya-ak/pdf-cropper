package crop

import (
	"encoding/json"
	"net/http"

	pdfcpu "github.com/pdfcpu/pdfcpu/pkg/api"
)

type Payload struct {
	Rect string `json:"rect"`
}

func Crop(w http.ResponseWriter, r *http.Request) {
	body := &Payload{}
	err := json.NewDecoder(r.Body).Decode(body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	in := "crop/ucsf.pdf"
	out := "crop/output.pdf"
	// [top, right, bottom, left]
	box, err := pdfcpu.Box(body.Rect, 0)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	err = pdfcpu.CropFile(in, out, []string{"1"}, box, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte("ok"))
}
