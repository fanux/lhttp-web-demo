package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	dir, _ := os.Getwd()
	dir = dir + "/lhttp-web-demo"
	h := http.FileServer(http.Dir(dir))
	err := http.ListenAndServe(":9090", h)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
