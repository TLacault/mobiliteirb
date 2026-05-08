#!/bin/bash
pdflatex report.tex
pdflatex report.tex
rm report.aux
rm report.toc
rm report.log
rm report.out
evince report.pdf