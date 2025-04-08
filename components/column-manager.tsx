"use client"

import { useState } from "react"
import { Check, Edit, Plus, Save, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ColumnManagerProps {
  data: any[]
  columns: string[]
  onColumnsUpdated: (updatedColumns: string[]) => void
}

export function ColumnManager({ data, columns, onColumnsUpdated }: ColumnManagerProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0] || "")
  const [newColumnName, setNewColumnName] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [editedColumnName, setEditedColumnName] = useState<string>("")
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null)

  const handleAddColumn = () => {
    if (!newColumnName || columns.includes(newColumnName)) return

    const updatedData = data.map((row) => ({ ...row, [newColumnName]: null }))
    const updatedColumns = [...columns, newColumnName]

    onColumnsUpdated(updatedColumns)
    setNewColumnName("")
    setSuccessMessage(`Successfully added column "${newColumnName}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleRenameColumn = (oldName: string, newName: string) => {
    if (!newName || oldName === newName || columns.includes(newName)) {
      setEditingColumn(null)
      setEditedColumnName("")
      return
    }

    const updatedData = data.map((row) => {
      const { [oldName]: value, ...rest } = row
      return { ...rest, [newName]: value }
    })

    const updatedColumns = columns.map((col) => (col === oldName ? newName : col))

    onColumnsUpdated(updatedColumns)
    setEditingColumn(null)
    setEditedColumnName("")
    setSuccessMessage(`Successfully renamed column "${oldName}" to "${newName}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleDeleteColumn = (column: string) => {
    const updatedData = data.map((row) => {
      const { [column]: _, ...rest } = row
      return rest
    })

    const updatedColumns = columns.filter((col) => col !== column)

    onColumnsUpdated(updatedColumns)
    setShowDeleteDialog(false)
    setColumnToDelete(null)
    setSuccessMessage(`Successfully deleted column "${column}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const startEditing = (column: string) => {
    setEditingColumn(column)
    setEditedColumnName(column)
  }

  const confirmDelete = (column: string) => {
    setColumnToDelete(column)
    setShowDeleteDialog(true)
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="add" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="add">Add Column</TabsTrigger>
          <TabsTrigger value="manage">Manage Columns</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-column">New Column Name</Label>
              <div className="flex gap-2">
                <Input
                  id="new-column"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Enter new column name"
                />
                <Button onClick={handleAddColumn} disabled={!newColumnName || columns.includes(newColumnName)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
              {columns.includes(newColumnName) && (
                <p className="text-sm text-red-500 mt-1">Column name already exists</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column Name</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((column) => (
                  <TableRow key={column}>
                    <TableCell>
                      {editingColumn === column ? (
                        <Input
                          value={editedColumnName}
                          onChange={(e) => setEditedColumnName(e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        column
                      )}
                    </TableCell>
                    <TableCell>{getColumnType(data, column)}</TableCell>
                    <TableCell className="text-right">
                      {editingColumn === column ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRenameColumn(column, editedColumnName)}
                          >
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingColumn(null)
                              setEditedColumnName("")
                            }}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(column)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(column)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Column</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the column "{columnToDelete}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => columnToDelete && handleDeleteColumn(columnToDelete)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getColumnType(data: any[], column: string): string {
  if (!data.length) return "Unknown"

  // Check the first few non-null values
  const sampleSize = Math.min(10, data.length)
  const samples = data
    .slice(0, sampleSize)
    .map((row) => row[column])
    .filter((val) => val !== null && val !== undefined)

  if (!samples.length) return "Empty"

  // Check if all values are numbers
  const allNumbers = samples.every((val) => !isNaN(Number(val)))
  if (allNumbers) return "Numeric"

  // Check if all values are dates
  const allDates = samples.every((val) => !isNaN(Date.parse(String(val))))
  if (allDates) return "Date"

  // Default to string
  return "Text"
}
