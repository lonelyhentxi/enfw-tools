
Sub 字体修改()
'
' 字体修改 宏
'
    Dim R_Character As Range


    Dim FontSize(5)
    FontSize(1) = "21"
    FontSize(2) = "21.5"
    FontSize(3) = "22"
    FontSize(4) = "22.5"
    FontSize(5) = "23"



    Dim FontName(3)
    FontName(1) = "陈静的字完整版"
    FontName(2) = "萌妹子体"
    FontName(3) = "liguofu"
    
    Dim FontColor(5)
    FontColor(1) = RGB(40, 40, 40)
    FontColor(5) = RGB(50, 50, 50)
    FontColor(4) = RGB(70, 70, 70)
    FontColor(3) = RGB(80, 80, 80)
    FontColor(2) = RGB(90, 90, 90)

    Dim ParagraphSpace(5)
    ParagraphSpace(1) = "12"
    ParagraphSpace(2) = "13"
    ParagraphSpace(3) = "20"
    ParagraphSpace(4) = "7"
    ParagraphSpace(5) = "12"

    For Each R_Character In ActiveDocument.Characters

        VBA.Randomize

        R_Character.Font.Name = FontName(Int(VBA.Rnd * 3) + 1)

        R_Character.Font.Size = FontSize(Int(VBA.Rnd * 5) + 1)
        
        R_Character.Font.Color = FontColor(Int(VBA.Rnd * 5) + 1)

        R_Character.Font.Position = Int(VBA.Rnd * 3) + 1

        R_Character.Font.Spacing = 0


    Next

    Application.ScreenUpdating = True



    For Each Cur_Paragraph In ActiveDocument.Paragraphs

        Cur_Paragraph.LineSpacing = ParagraphSpace(Int(VBA.Rnd * 5) + 1)


    Next
        Application.ScreenUpdating = True


End Sub
